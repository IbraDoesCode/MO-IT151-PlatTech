import { Request, Response } from "express";
import { HTTPResponse } from "../utils/http-response";
import Product from "../models/product.model";
import mongoose from "mongoose";
import redis from "../utils/redis";
import logger from "../utils/logger";
import {
  ACTIVE_PRODUCT_LISTING_KEYS_SET,
  invalidateProductCache,
  PRODUCT_BY_ID_PREFIX,
  PRODUCT_QUERY_PREFIX,
  TIME_TO_LIVE,
} from "../utils/cache";
import { resolveBrand, resolveCategory } from "../utils/resolveRefs";

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      logger.warn("Invalid id received", {
        id: id,
      });
      HTTPResponse.badRequest(res, "Invalid Id");
      return;
    }

    const cacheKey = `${PRODUCT_BY_ID_PREFIX}${id}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      HTTPResponse.ok(res, "Product retrieved from cache", JSON.parse(cached));
      return;
    }

    const product = await Product.findById(id);

    if (!product) {
      logger.error(`Product not found for id: ${id}`);
      HTTPResponse.notFound(res, "Product not found", null);
      return;
    }

    // Cache for 5 mins
    await redis.set(cacheKey, JSON.stringify(product), "EX", TIME_TO_LIVE);

    HTTPResponse.ok(res, "Product successfully retrieved", product);
  } catch (error) {
    logger.error("An unexpected error has occurred", error);
    HTTPResponse.internalServerError(res, "Internal server error", error);
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filters: Record<string, any> = {};

    const { name, brand, category, price, rating } = req.query;

    if (name) filters.name = { $regex: name, $options: "i" };
    if (brand) filters.brand = { $regex: brand, $options: "i" };
    if (category) filters.category = category;
    if (price) filters.price = Number(price);
    if (rating)
      filters.rating = { $gte: Number(rating), $lt: Number(rating) + 1 };

    // Create a consistent and unique cache key for dynamic consumption
    const cacheKey = `${PRODUCT_QUERY_PREFIX}${JSON.stringify(
      filters
    )}:page:${page}:limit:${limit}`;

    const cached = await redis.get(cacheKey);

    if (cached) {
      HTTPResponse.ok(res, "Products retrieved from cache", JSON.parse(cached));
      return;
    }

    const products = await Product.find(filters)
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

    // Cache for 5 minutes (300 seconds)
    await redis.set(cacheKey, JSON.stringify(result), "EX", TIME_TO_LIVE);
    // Add this specific query cache key to our master set for easy invalidation
    await redis.sadd(ACTIVE_PRODUCT_LISTING_KEYS_SET, cacheKey);
    logger.info(`Added ${cacheKey} to ${ACTIVE_PRODUCT_LISTING_KEYS_SET}`);

    HTTPResponse.ok(res, "Product successfully retrieved", result);
  } catch (error) {
    logger.error("An unexpected error has occurred", error);
    HTTPResponse.internalServerError(res, "Internal server error", error);
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, brand, description, category, price, rating, image_url } =
      req.body;

    if (!name || !brand || !description || !category || !price) {
      HTTPResponse.badRequest(
        res,
        "Missing required field(s): name, brand, description, category, price."
      );
      return;
    }

    let productImageUrl = image_url;
    if (!Boolean(productImageUrl)) {
      productImageUrl = "https://placehold.co/300/webp?text=Image%20Here";
    }

    const brandId = (await resolveBrand(brand))._id;
    const categoryId = (await resolveCategory(category))._id;

    const newProduct = new Product({
      name,
      brand: brandId,
      description,
      category: categoryId,
      price,
      rating,
      image_url: productImageUrl,
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
    await invalidateProductCache(populatedProduct._id.toString());

    HTTPResponse.ok(res, "Product successfully created.", populatedProduct);
  } catch (error) {
    logger.error("An unexpected error has occurred", error);
    HTTPResponse.internalServerError(res, "Internal server error", error);
  }
};

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
    const brandId = (await resolveBrand(brand))._id;
    const categoryId = (await resolveCategory(brand))._id;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        brand: brandId,
        category: categoryId,
        ...restUpdateFields,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate(["brand", "category"]);

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
    await invalidateProductCache(updatedProduct._id.toString());

    HTTPResponse.ok(res, "Product successfully updated.", updatedProduct);
  } catch (error) {
    logger.error("An unexpected error has occurred", error);
    HTTPResponse.internalServerError(res, "Internal server error", error);
  }
};

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
    await invalidateProductCache(id);

    HTTPResponse.ok(res, `Product deleted successfully: ${id}`, null);
  } catch (error) {
    logger.error("An unexpected error has occurred", error);
    HTTPResponse.internalServerError(res, "Internal server error", error);
  }
};
