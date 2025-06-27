import { Request, Response } from "express";
import logger from "../utils/logger";
import { HTTPResponse } from "../utils/http-response";
import Cart from "../models/cart.model";
import mongoose from "mongoose";

// valid user id:
// 685de027e9ae7f83b7f143d0

// valid cart id:
// 685de053a523cbafa6fe847d

export const createCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      HTTPResponse.badRequest(res, "Invalid user ID.");
      return;
    }

    const cart = new Cart({ items: [], ...(userId && { userId }) });

    const savedCart = await cart.save();

    HTTPResponse.ok(res, "Successfully created cart.", savedCart);
  } catch (error) {
    logger.error("An unexpected error has occurred", error);
    HTTPResponse.internalServerError(res, "Internal server error", error);
  }
};

export const getCartById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      HTTPResponse.badRequest(res, "Invalid Cart ID.");
      return;
    }

    const cart = await Cart.findById(id).populate("items.product");

    if (!cart) {
      HTTPResponse.notFound(res, "Cart not found.");
      return;
    }

    HTTPResponse.ok(res, "Cart found.", cart);
  } catch (error) {
    logger.error("Failed to get cart", { error });
    HTTPResponse.internalServerError(res, "Could not get cart");
  }
};

export const updateCart = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      HTTPResponse.badRequest(res, "Invalid Cart ID.");
      return;
    }

    const updatedCart = await Cart.findByIdAndUpdate(
      id,
      {
        items,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedCart) {
      HTTPResponse.notFound(res, "Cart not found.");
      return;
    }

    HTTPResponse.ok(res, "Cart updated.", updatedCart);
  } catch (error) {
    logger.error("Failed to update cart", { error });
    HTTPResponse.internalServerError(res, "Could not update cart");
  }
};

export const deleteCart = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      HTTPResponse.badRequest(res, "Invalid Cart ID.");
      return;
    }

    const deletedCart = await Cart.findByIdAndDelete(id);

    if (!deletedCart) {
      HTTPResponse.notFound(res, "Cart not found.");
      return;
    }

    HTTPResponse.ok(res, "Cart deleted", id);
  } catch (error) {
    logger.error("Failed to delete cart", { error });
    HTTPResponse.internalServerError(res, "Could not delete cart") 
  }
}
