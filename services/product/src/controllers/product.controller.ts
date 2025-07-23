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
import Brand from "../models/brand.model";
import Category from "../models/category.model";
import { priceRangeFilters, productsFilters } from "../utils/query";
import Review from "../models/review.model";

/**
 * Fetch a single product by its MongoDB ObjectId.
 *
 * @route GET /product/:id
 * @param req.params.id - The product's ObjectId (string)
 * @returns 200 with product data, 400 if invalid id, 404 if not found
 *
 * Caches result for 5 minutes.
 */
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

    const reviews = await Review.find({ product: id });

    if (!product) {
      logger.error(`Product not found for id: ${id}`);
      HTTPResponse.notFound(res, "Product not found", null);
      return;
    }

    const productWithReviews = {
      ...product.toJSON(),
      reviews,
    };

    // Cache for 5 mins
    await redis.set(
      cacheKey,
      JSON.stringify(productWithReviews),
      "EX",
      TIME_TO_LIVE
    );

    HTTPResponse.ok(res, "Product successfully retrieved", productWithReviews);
  } catch (error) {
    logger.error("An unexpected error has occurred", error);
    HTTPResponse.internalServerError(res, "Internal server error", error);
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
 * Caches result for 5 minutes.
 */
export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filters = await productsFilters(req.query);

    filters.status = "active";

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

/**
 * Fetch a list of products matching a partial name for autocomplete.
 *
 * @route GET /products/autocomplete?q=searchTerm
 * @returns 200 with a limited list of matching product names and IDs
 */
export const autocompleteProducts = async (req: Request, res: Response) => {
  try {
    const searchQuery = (req.query.q as string)?.trim();

    // If the query is blank or missing, return an empty list instead of an error
    if (!searchQuery) {
      HTTPResponse.ok(res, "Empty query. No products returned.", []);
      return;
    }

    const products = await Product.find({
      name: { $regex: searchQuery, $options: "i" },
    })
      .limit(8)
      .select("name image_url");

    HTTPResponse.ok(res, "Autocomplete results retrieved.", products);
  } catch (error) {
    logger.error("Failed to fetch autocomplete results", { error });
    HTTPResponse.internalServerError(
      res,
      "Could not fetch autocomplete results."
    );
  }
};

/**
 * Fetch all product categories.
 *
 * @route GET /product/categories
 * @returns 200 with categories, 404 if none found
 *
 * Caches result for 5 minutes.
 */
export const getProductCategories = async (req: Request, res: Response) => {
  try {
    const cacheKey = `${PRODUCT_QUERY_PREFIX}categories`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      HTTPResponse.ok(
        res,
        "Categories retrieved from cache",
        JSON.parse(cached)
      );
      return;
    }

    // Get all the categories with aggregate of the total product count in each category
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "category",
          as: "products",
        },
      },
      {
        $addFields: {
          productCount: { $size: "$products" },
        },
      },
      {
        $project: {
          products: 0,
          __v: 0,
        },
      },
      {
        $sort: {
          productCount: -1,
        },
      },
    ]);

    if (!categories.length) {
      HTTPResponse.notFound(res, "No categories found.", []);
      return;
    }

    // Need to manually change _id -> id because toJSON doesn't get applied in Model.aggregate()
    const transformedCategories = categories.map((category) => {
      const { _id, ...rest } = category;
      return {
        id: _id.toString(),
        ...rest,
      };
    });

    // Cache for 5 minutes (300 seconds)
    await redis.set(
      cacheKey,
      JSON.stringify(transformedCategories),
      "EX",
      TIME_TO_LIVE
    );
    // Add this specific query cache key to our master set for easy invalidation
    await redis.sadd(ACTIVE_PRODUCT_LISTING_KEYS_SET, cacheKey);

    HTTPResponse.ok(
      res,
      "Successfully fetched all categories.",
      transformedCategories
    );
  } catch (error) {
    logger.error("Failed to fetch categories.", { error });
    HTTPResponse.internalServerError(res, "Could not fetch categories.");
  }
};

/**
 * Fetch all product brands.
 *
 * @route GET /product/brands
 * @returns 200 with brands, 404 if none found
 *
 * Caches result for 5 minutes.
 */
export const getProductBrands = async (req: Request, res: Response) => {
  try {
    const cacheKey = `${PRODUCT_QUERY_PREFIX}brands`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      HTTPResponse.ok(res, "Products retrieved from cache", JSON.parse(cached));
      return;
    }

    const brands = await Brand.find();

    if (!Boolean(brands)) {
      HTTPResponse.notFound(res, "No brands found.", brands);
      return;
    }

    // Cache for 5 minutes (300 seconds)
    await redis.set(cacheKey, JSON.stringify(brands), "EX", TIME_TO_LIVE);
    // Add this specific query cache key to our master set for easy invalidation
    await redis.sadd(ACTIVE_PRODUCT_LISTING_KEYS_SET, cacheKey);

    HTTPResponse.ok(res, "Successfully fetched all brands.", brands);
  } catch (error) {
    logger.error("Failed to fetch brands.", { error });
    HTTPResponse.internalServerError(res, "Could not fetch brands.");
  }
};

/**
 * Fetch the minimum and maximum price between all of the products
 *
 * @route GET /product/price
 * @returns 200 with products, 404 if no products in the database
 *
 * Caches result for 5 minutes.
 */
export const getProductPriceRange = async (req: Request, res: Response) => {
  try {
    const filters = await priceRangeFilters(req.query);

    const cacheKey = `${PRODUCT_QUERY_PREFIX}price-range:${JSON.stringify(
      filters
    )}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      HTTPResponse.ok(
        res,
        "Price range retrieved from cache",
        JSON.parse(cached)
      );
      return;
    }

    const priceRange = await Product.aggregate([
      { $match: filters },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
      {
        $project: {
          _id: 0,
          minPrice: 1,
          maxPrice: 1,
        },
      },
    ]);

    if (!priceRange.length) {
      HTTPResponse.notFound(res, "No products found.", priceRange);
      return;
    }

    const priceRes = priceRange[0];

    // Cache for 5 minutes (300 seconds)
    await redis.set(cacheKey, JSON.stringify(priceRes), "EX", TIME_TO_LIVE);
    // Add this specific query cache key to our master set for easy invalidation
    await redis.sadd(ACTIVE_PRODUCT_LISTING_KEYS_SET, cacheKey);

    HTTPResponse.ok(res, "Price range retrieved.", priceRes);
  } catch (error) {
    logger.error("Failed to fetch brands.", { error });
    HTTPResponse.internalServerError(res, "Could not fetch brands.");
  }
};
