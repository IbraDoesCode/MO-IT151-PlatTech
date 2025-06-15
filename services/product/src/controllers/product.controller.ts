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
      HTTPResponse.error(res, 400, "Invalid Id");
      return;
    }

    const cached = await redis.get(`product:${id}`);
    if (cached) {
      HTTPResponse.success(
        res,
        200,
        "Product retrieved from cache",
        JSON.parse(cached)
      );
      return;
    }

    const product = await Product.findById(id);

    if (!product) {
      logger.error(`Product not found for id: ${id}`);
      HTTPResponse.error(res, 404, "Product not found", null);
      return;
    }

    await redis.set(`product:${id}`, JSON.stringify(product), "EX", 3600);

    HTTPResponse.success(res, 200, `Product successfully retrieved`, product);
  } catch (error) {
    logger.error("An unexpected error has occurred", error);
    HTTPResponse.error(res, 500, "Internal server error");
  }
};

export const getProductByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    if (!name) {
      logger.warn("Invalid product name received", {
        name: name,
      });
      HTTPResponse.error(res, 400, "Empty or invalid product name.");
    }

    const product = await Product.findOne({ name: name });

    const cached = await redis.get(`product:name:${name}`);
    if (cached) {
      HTTPResponse.success(
        res,
        200,
        "Product retrieved from cache",
        JSON.parse(cached)
      );
      return;
    }

    if (!product) {
      logger.error(`Product not found for name: ${name}`);
      HTTPResponse.error(res, 404, "Product not found", null);
      return;
    }

    await redis.set(
      `product:name:${name}`,
      JSON.stringify(product),
      "EX",
      3600
    );

    HTTPResponse.success(res, 200, `Product successfully retrieved`, product);
  } catch (error) {
    logger.error("An unexpected error has occurred", error);
    HTTPResponse.error(res, 500, "Internal server error");
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
      HTTPResponse.success(
        res,
        200,
        `Products retrieved from cache`,
        JSON.parse(cached)
      );
      return;
    }

    const products = await Product.find(filters)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    if (!products) {
      logger.error(`Products not found`);
      HTTPResponse.error(res, 404, "Products not found", null);
      return;
    }

    const total = await Product.countDocuments(filters);

    if (!products.length) {
      HTTPResponse.error(res, 404, "Products not found", null);
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

    HTTPResponse.success(res, 200, `Product successfully retrieved`, result);
  } catch (error) {
    logger.error("An unexpected error has occurred", error);
    HTTPResponse.error(res, 500, "Internal server error");
  }
};
