import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../utils/Response";
import Product from "../models/product.model";
import mongoose from "mongoose";

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      next(ApiResponse.error(res, 400, "Invalid Id"));
    }
    const product = await Product.findById(id);

    if (!product) next(ApiResponse.error(res, 404, "Product not found", null));

    next(
      ApiResponse.success(res, 200, `Product successfully retrieved`, product)
    );
  } catch (error) {
    console.error("An unexpected error has occurred", error);
    next(ApiResponse.error(res, 500, "Internal server error"));
  }
};

export const getProductByName = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.params;

    if (!name)
      next(ApiResponse.error(res, 400, "Empty or invalid product name."));

    const product = await Product.findOne({ name: name });

    if (!product) next(ApiResponse.error(res, 404, "Product not found", null));

    next(
      ApiResponse.success(res, 200, `Product successfully retrieved`, product)
    );
  } catch (error) {
    console.error("An unexpected error has occurred", error);
    next(ApiResponse.error(res, 500, "Internal server error"));
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filters: Record<string, any> = {};

    if (req.query.brand) {
      filters.brand = req.query.brand;
    }

    if (req.query.category) {
      filters.category = req.query.category;
    }

    const products = await Product.find(filters)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    if (!products)
      next(ApiResponse.error(res, 404, "Products not found", null));

    const total = await Product.countDocuments(filters);

    if (!products.length) {
      return next(ApiResponse.error(res, 404, "Products not found", null));
    }

    next(
      ApiResponse.success(res, 200, `Product successfully retrieved`, {
        products,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      })
    );
  } catch (error) {
    console.error("An unexpected error has occurred", error);
    next(ApiResponse.error(res, 500, "Internal server error"));
  }
};
