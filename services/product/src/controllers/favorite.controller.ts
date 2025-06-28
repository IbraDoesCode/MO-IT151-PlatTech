import { Request, Response } from "express";
import { HTTPResponse } from "../utils/http-response";
import logger from "../utils/logger";
import Favorite from "../models/favorite.model";
import mongoose from "mongoose";

/**
 * Create a new favorites list.
 *
 * @route POST /favorites
 * @returns 200 with created favorites document
 *
 * Creates a new favorites document with an empty favorites array.
 */
export const createFavorite = async (req: Request, res: Response) => {
  try {
    const newFavorite = new Favorite({
      favorites: [],
    });

    const savedFavorite = newFavorite.save();

    HTTPResponse.ok(res, "Successfully created favorites.", savedFavorite);
  } catch (error) {
    logger.error("Failed to create favorites", { error });
    HTTPResponse.internalServerError(res, "Could not create favorites");
  }
};

/**
 * Get a favorites list by its ObjectId.
 *
 * @route GET /favorites/:favoriteId
 * @param req.params.favoriteId - The favorites document's ObjectId (string)
 * @returns 200 with favorites, 400 if invalid id, 404 if not found
 *
 * Populates product details in favorites.
 */
export const getFavoriteById = async (req: Request, res: Response) => {
  try {
    const { favoriteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(favoriteId)) {
      HTTPResponse.badRequest(res, "Invalid favorite ID.");
      return;
    }

    const favorite = await Favorite.findById(favoriteId).populate(
      "favorites.product"
    );

    if (!Boolean(favorite)) {
      HTTPResponse.notFound(res, "No favorites found.");
      return;
    }

    HTTPResponse.ok(res, "Successfully fetched favorites.", favorite);
  } catch (error) {
    logger.error("Failed to fetch favorites", { error });
    HTTPResponse.internalServerError(res, "Could not fetch favorites");
  }
};

/**
 * Toggle a product in the favorites list (add if not present, remove if present).
 *
 * @route PUT /favorites/:favoriteId
 * @param req.params.favoriteId - The favorites document's ObjectId (string)
 * @param req.body.productId - The product's ObjectId (string)
 * @returns 200 with updated favorites, 400 if invalid ids, 404 if not found
 *
 * If the product is already in favorites, removes it. Otherwise, adds it.
 */
export const toggleUpdateFavorite = async (req: Request, res: Response) => {
  try {
    const { favoriteId } = req.params;
    const { productId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(favoriteId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      HTTPResponse.badRequest(res, "Invalid favorite ID or product ID.");
      return;
    }

    const pullResult = await Favorite.updateOne(
      {
        _id: favoriteId,
        "favorites.product": productId,
      },
      {
        $pull: { favorites: { product: productId } },
        $inc: { quantity: -1 },
      }
    );

    if (pullResult.modifiedCount > 0) {
      // Product was present and removed
      const updated = await Favorite.findById(favoriteId).populate(
        "favorites.product"
      );
      HTTPResponse.ok(res, "Product removed from favorites.", updated);
      return;
    }

    const pushResult = await Favorite.findByIdAndUpdate(
      favoriteId,
      { $push: { favorites: { product: productId } }, $inc: { quantity: 1 } },
      { new: true }
    ).populate("favorites.product");

    HTTPResponse.ok(res, "Product added to favorites.", pushResult);
  } catch (error) {
    logger.error("Failed to toggle favorite", { error });
    HTTPResponse.internalServerError(res, "Could not update favorites");
  }
};

/**
 * Delete a favorites list by its ObjectId.
 *
 * @route DELETE /favorites/:favoriteId
 * @param req.params.favoriteId - The favorites document's ObjectId (string)
 * @returns 200 if deleted, 400 if invalid id, 404 if not found
 */
export const deleteFavorite = async (req: Request, res: Response) => {
  try {
    const { favoriteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(favoriteId)) {
      HTTPResponse.badRequest(res, "Invalid favorite ID.");
      return;
    }

    const deletedFavorite = await Favorite.findByIdAndDelete(favoriteId);

    if (!deletedFavorite) {
      HTTPResponse.notFound(res, "Favorite not found.");
      return;
    }

    HTTPResponse.ok(
      res,
      "Successfully deleted favorites.",
      deletedFavorite._id
    );
  } catch (error) {
    logger.error("Failed to delete favorites", { error });
    HTTPResponse.internalServerError(res, "Could not delete favorites");
  }
};
