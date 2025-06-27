import { Request, Response } from "express";
import logger from "../utils/logger";
import { HTTPResponse } from "../utils/http-response";
import Category from "../models/category.model";

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find();

    logger.info(categories)

    if (!Boolean(categories)) {
      HTTPResponse.notFound(res, "No categories found.", categories);
      return;
    }

    HTTPResponse.ok(res, "Successfully fetched all categories.", categories);
  } catch (error) {
    logger.error("Failed to fetch categories.", { error });
    HTTPResponse.internalServerError(res, "Could not fetch categories.");
  }
};
