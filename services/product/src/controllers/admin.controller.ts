import { Request, Response } from "express";
import { productsFilters } from "../utils/query";
import { HTTPResponse } from "../utils/http-response";
import Product from "../models/product.model";
import logger from "../utils/logger";
import { resolveBrand, resolveCategory } from "../utils/resolveRefs";
import redis from "../utils/redis";
import {
  invalidateProductCache,
  PRODUCT_BY_ID_PREFIX,
  TIME_TO_LIVE,
} from "../utils/cache";
import mongoose from "mongoose";

/**
 * Fetch product-related KPIs for the admin dashboard.
 *
 * @route GET /products/kpis
 * @returns 200 with total asset value, total unique products, total stock,
 * and a breakdown of stock statuses (in stock, low stock, no stock)
 *
 * Does not use caching.
 */
export const getDashboardKPI = async (req: Request, res: Response) => {
  try {
    const [aggregated] = await Product.aggregate([
      {
        $facet: {
          totalAssetValue: [
            {
              $group: {
                _id: null,
                totalValue: { $sum: { $multiply: ["$price", "$quantity"] } },
              },
            },
          ],
          totalUniqueProducts: [{ $count: "count" }],
          totalStock: [
            {
              $group: {
                _id: null,
                total: { $sum: "$quantity" },
              },
            },
          ],
          stockBreakdown: [
            {
              $group: {
                _id: {
                  $switch: {
                    branches: [
                      { case: { $eq: ["$quantity", 0] }, then: "noStock" },
                      { case: { $lte: ["$quantity", 10] }, then: "lowStock" },
                    ],
                    default: "inStock",
                  },
                },
                count: { $sum: 1 },
              },
            },
          ],
          statusBreakdown: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    type StockStatus = "inStock" | "lowStock" | "noStock";
    type ProductStatus = "active" | "inactive" | "discontinued";

    const result = {
      totalAssetValue: aggregated.totalAssetValue[0]?.totalValue || 0,
      totalUniqueProducts: aggregated.totalUniqueProducts[0]?.count || 0,
      totalStock: aggregated.totalStock[0]?.total || 0,
      stockBreakdown: {
        inStock: 0,
        lowStock: 0,
        noStock: 0,
      } as Record<StockStatus, number>,
      statusBreakdown: {
        active: 0,
        inactive: 0,
        discontinued: 0,
      } as Record<ProductStatus, number>,
    };

    for (const item of aggregated.stockBreakdown) {
      const status = item._id as StockStatus;
      if (status in result.stockBreakdown) {
        result.stockBreakdown[status] = item.count;
      }
    }

    for (const item of aggregated.statusBreakdown) {
      const status = item._id as ProductStatus;
      if (status in result.statusBreakdown) {
        result.statusBreakdown[status] = item.count;
      }
    }

    HTTPResponse.ok(res, "Product KPIs retrieved", result);
  } catch (error) {
    console.error("Error fetching product KPIs", error);
    HTTPResponse.internalServerError(res, "Failed to get product KPIs", error);
  }
};

/**
 * Fetch a paginated list of products, optionally filtered by query parameters.
 *
 * @route GET /products
 * @param req.query.page (optional, default: 1) - Page number
 * @param req.query.limit (optional, default: 10) - Items per page
 * @param req.query.name (optional) - Search filtering fields
 * @param req.query.brand (optional) - Filtering fields
 * @param req.query.category (optional) - Filtering fields
 * @param req.query.minPrice (optional) - Filtering fields
 * @param req.query.maxPrice (optional) - Filtering fields
 * @param req.query.rating (optional) - Filtering fields
 * @returns 200 with products and pagination info, 404 if none found
 *
 * Does not use caching
 */
export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filters = await productsFilters(req.query);

    const products = await Product.find(filters)
      .select("-description -images")
      .limit(limit * 1)
      .skip((page - 1) * limit);

    if (!Boolean(products.length)) {
      logger.error("No products found matching the criteria.");
      HTTPResponse.notFound(res, "No products found.", null);
      return;
    }

    const total = await Product.countDocuments(filters);

    const result = {
      products,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    HTTPResponse.ok(res, "Product successfully retrieved", result);
  } catch (error) {
    logger.error("An unexpected error has occurred", error);
    HTTPResponse.internalServerError(res, "Internal server error", error);
  }
};

/**
 * Create a new product.
 *
 * @route POST /products
 * @param req.body.name (string) - Required
 * @param req.body.brand (string) - Required (brand name)
 * @param req.body.description (string) - Required
 * @param req.body.category (string) - Required (category slug)
 * @param req.body.price (number) - Required
 * @param req.body.rating (number) - Optional
 * @param req.body.image_url (string) - Optional
 * @returns 200 with created product, 400 if missing fields
 *
 * Resolves brand and category to ObjectIds (creates if not exist).
 * Caches result and invalidates related caches.
 */
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, brand, description, category, price, image_url } = req.body;

    if (!name || !brand || !description || !category || !price) {
      HTTPResponse.badRequest(
        res,
        "Missing required field(s): name, brand, description, category, price."
      );
      return;
    }

    const files = (req.files as Express.Multer.File[]) ?? [];
    const imagePaths = files.map(
      (file) => `${req.protocol}://${req.get("host")}/${file.path}`
    );

    let productImageUrl = image_url;
    if (imagePaths.length === 0 && !Boolean(productImageUrl)) {
      productImageUrl = "https://placehold.co/300/webp?text=Image%20Here";
    }

    const brandId = (await resolveBrand(brand === "" ? null : brand))._id;
    const categoryId = (await resolveCategory(category))._id;

    const priceNum = parseFloat(req.body.price);
    const rating = req.body.rating ? parseFloat(req.body.rating) : undefined;
    const quantity = req.body.quantity
      ? parseInt(req.body.quantity, 10)
      : undefined;

    const newProduct = new Product({
      name,
      brand: brandId,
      description,
      category: categoryId,
      price: priceNum,
      rating,
      quantity,
      image_url: productImageUrl == "" ? imagePaths[0] : productImageUrl,
      images: productImageUrl == "" ? imagePaths : [productImageUrl],
    });

    const savedProduct = await newProduct.save();

    const populatedProduct = await savedProduct.populate(["brand", "category"]);

    // Cache the newly created product by ID (for direct lookup)
    await redis.set(
      `${PRODUCT_BY_ID_PREFIX}${populatedProduct._id}`,
      JSON.stringify(populatedProduct),
      "EX",
      TIME_TO_LIVE
    );

    // Invalidate all related caches after a new product is created
    await invalidateProductCache([populatedProduct._id.toString()]);

    HTTPResponse.ok(res, "Product successfully created.", populatedProduct);
  } catch (error) {
    logger.error("An unexpected error has occurred", error);
    HTTPResponse.internalServerError(res, "Internal server error", error);
  }
};

/**
 * Update an existing product.
 *
 * @route PUT /product/:id
 * @param req.params.id - The product's ObjectId
 * @param req.body - Fields to update (brand and category as names/slugs)
 * @returns 200 with updated product, 400 if invalid, 404 if not found
 *
 * Resolves brand and category to ObjectIds (creates if not exist).
 * Caches result and invalidates related caches.
 */
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      HTTPResponse.badRequest(res, "Invalid product ID.");
      return;
    }

    const updateFields = req.body;

    if (Object.keys(updateFields).length == 0) {
      HTTPResponse.badRequest(res, "No fields provided to update.");
      return;
    }

    const { brand, category, ...restUpdateFields } = updateFields;

    // Resolve to object ids
    let brandId, categoryId;

    if (brand) brandId = (await resolveBrand(brand))._id;
    if (category) categoryId = (await resolveCategory(category))._id;

    const updateData: any = {
      ...restUpdateFields,
    };

    if (brandId) updateData.brand = brandId;
    if (categoryId) updateData.category = categoryId;
    if (req.file) updateData.image = req.file.filename;

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate(["brand", "category"]);

    if (!updatedProduct) {
      HTTPResponse.notFound(res, "Product not found.");
      return;
    }

    // Cache the updated product by ID (for direct lookup)
    await redis.set(
      `${PRODUCT_BY_ID_PREFIX}${updatedProduct._id}`,
      JSON.stringify(updatedProduct),
      "EX",
      TIME_TO_LIVE
    );

    // Invalidate all related caches after a product is updated
    await invalidateProductCache([updatedProduct._id.toString()]);

    HTTPResponse.ok(res, "Product successfully updated.", updatedProduct);
  } catch (error) {
    logger.error("An unexpected error has occurred", error);
    HTTPResponse.internalServerError(res, "Internal server error", error);
  }
};

/**
 * Delete a product by its ObjectId.
 *
 * @route DELETE /product/:id
 * @param req.params.id - The product's ObjectId
 * @returns 200 if deleted, 400 if invalid, 404 if not found
 *
 * Invalidates related caches.
 */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      HTTPResponse.badRequest(res, "Invalid Product ID.");
      return;
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      HTTPResponse.notFound(res, "Product not found.");
      return;
    }

    // Invalidate all related caches of this product
    await invalidateProductCache([id]);

    HTTPResponse.ok(res, `Product deleted successfully: ${id}`, null);
  } catch (error) {
    logger.error("An unexpected error has occurred", error);
    HTTPResponse.internalServerError(res, "Internal server error", error);
  }
};
