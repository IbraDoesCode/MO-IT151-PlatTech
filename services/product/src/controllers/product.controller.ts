import { Request, Response } from "express";
import { HTTPResponse } from "../utils/http-response";
import Product from "../models/product.model";
import mongoose from "mongoose";
import redis from "../utils/redis";
import logger from "../utils/logger";

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

    const cached = await redis.get(`product:${id}`);
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

    await redis.set(`product:${id}`, JSON.stringify(product), "EX", 3600);

    HTTPResponse.ok(res, `Product successfully retrieved`, product);
  } catch (error) {
    logger.error("An unexpected error has occurred", error);
    HTTPResponse.internalServerError(res, "Internal server error", error);
  }
};

export const getProductByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    if (!name) {
      logger.warn("Invalid product name received", {
        name: name,
      });
      HTTPResponse.badRequest(res, "Empty or invalid product name.");
    }

    const product = await Product.find({
      name: { $regex: name, $options: "i" },
    });

    const cached = await redis.get(`product:name:${name}`);
    if (cached) {
      HTTPResponse.ok(res, "Product retrieved from cache", JSON.parse(cached));
      return;
    }

    if (!product) {
      logger.error(`Product not found for name: ${name}`);
      HTTPResponse.notFound(res, "Product not found");
      return;
    }

    await redis.set(
      `product:name:${name}`,
      JSON.stringify(product),
      "EX",
      3600
    );

    HTTPResponse.ok(res, `Product successfully retrieved`, product);
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

    // To dynamically query for a specific property
    const { name, brand, category, price, rating } = req.query;

    // Dynamically build the query object
    if (name) filters.name = { $regex: name, $options: "i" };
    if (brand) filters.brand = { $regex: brand, $options: "i" };
    if (category) filters.category = category;
    if (price) filters.price = Number(price);
    if (rating)
      filters.rating = { $gte: Number(rating), $lt: Number(rating) + 1 };

    // Create the cache key for dynamic consumption
    const cacheKey = `products:${JSON.stringify(
      filters
    )}:page:${page}:limit:${limit}`;

    // First check if the product being fetched is cached
    const cached = await redis.get(cacheKey);

    // Return the cached value if there are any
    if (cached) {
      HTTPResponse.ok(res, `Products retrieved from cache`, JSON.parse(cached));
      return;
    }

    // If there are no cached products, try to find it in mongodb
    const products = await Product.find(filters)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Return this error message if there are filters
    if (!Boolean(products.length) && Object.keys(filters).length > 0) {
      logger.error(`No products matched the given filters.`);
      HTTPResponse.notFound(
        res,
        "No products matched the given filters.",
        null
      );
      return;
    }

    // Return this error if there are NO filters
    if (!Boolean(products.length)) {
      logger.error(`Products not found`);
      HTTPResponse.notFound(res, "Products not found", null);
      return;
    }

    const total = await Product.countDocuments(filters);

    // NOTE: I don't think this check is necessary
    if (!Boolean(products.length)) {
      HTTPResponse.notFound(res, "Products not found", null);
      return;
    }

    const result = {
      products,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    // Set cache after a successful query of the products
    await redis.set(cacheKey, JSON.stringify(result), "EX", 300);

    HTTPResponse.ok(res, `Product successfully retrieved`, result);
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

    // Provide a placeholder image if image_url isn't present
    let productImageUrl = image_url;

    if (!Boolean(productImageUrl)) {
      productImageUrl = "https://placehold.co/300/webp?text=Image%20Here";
    }

    // Create product entry
    const newProduct = new Product({
      name,
      brand,
      description,
      category,
      price,
      rating,
      image_url: productImageUrl,
    });

    const savedProduct = await newProduct.save();

    // Cache by ID lookup
    await redis.set(
      `product:${savedProduct._id}`,
      JSON.stringify(savedProduct),
      "EX",
      300
    );

    HTTPResponse.ok(res, "Product successfully created.", savedProduct);
  } catch (error) {
    logger.error("An unexpected error has occurred", error);
    HTTPResponse.internalServerError(res, "Internal server error", error);
  }
};