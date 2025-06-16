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

    const product = await Product.findOne({ name: name });

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

    if (req.query.brand) filters.brand = req.query.brand;
    if (req.query.category) filters.category = req.query.category;

    const cacheKey = `products:${JSON.stringify(
      filters
    )}:page:${page}:limit:${limit}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      HTTPResponse.ok(res, `Products retrieved from cache`, JSON.parse(cached));
      return;
    }

    const products = await Product.find(filters)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    if (!products) {
      logger.error(`Products not found`);
      HTTPResponse.notFound(res, "Products not found", null);
      return;
    }

    const total = await Product.countDocuments(filters);

    if (!products.length) {
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

    await redis.set(cacheKey, JSON.stringify(result), "EX", 300);

    HTTPResponse.ok(res, `Product successfully retrieved`, result);
  } catch (error) {
    logger.error("An unexpected error has occurred", error);
    HTTPResponse.internalServerError(res, "Internal server error", error);
  }
};
