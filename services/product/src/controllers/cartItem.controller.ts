import { Request, Response } from "express";
import mongoose from "mongoose";
import Cart from "../models/cart.model";
import { HTTPResponse } from "../utils/http-response";
import logger from "../utils/logger";

export const upsertCartItem = async (req: Request, res: Response) => {
  try {
    const { cartId } = req.params;
    const { productId, quantity } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(cartId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      HTTPResponse.badRequest(res, "Invalid Cart ID or Product ID.");
      return;
    }

    // If quantity is 0, try to remove the item if it exists
    if (quantity === 0) {
      const removeResult = await Cart.findOneAndUpdate(
        { _id: cartId, "items.product": productId },
        {
          $pull: { items: { product: productId } },
        },
        { new: true }
      ).populate("items.product");

      if (removeResult) {
        HTTPResponse.ok(res, "Item removed from cart.", removeResult);
        return;
      }

      // Item didn't exist — fetch the cart to return it anyway
      const currentCart = await Cart.findById(cartId).populate("items.product");

      if (!currentCart) {
        HTTPResponse.notFound(res, "Cart not found.");
        return;
      }

      HTTPResponse.ok(res, "No action taken. Item not in cart.", currentCart);
      return;
    }

    const updateResult = await Cart.findOneAndUpdate(
      { _id: cartId, "items.product": productId },
      { $set: { "items.$.quantity": quantity } },
      { new: true, runValidators: true }
    ).populate("items.product");

    if (updateResult) {
      HTTPResponse.ok(res, "Item quantity updated.", updateResult);
      return;
    }

    const pushResult = await Cart.findByIdAndUpdate(
      cartId,
      {
        $push: {
          items: {
            product: productId,
            quantity,
          },
        },
      },
      {
        runValidators: true,
        new: true,
      }
    ).populate("items.product");

    if (!pushResult) {
      HTTPResponse.notFound(res, "Cart not found.");
      return;
    }

    HTTPResponse.ok(res, "Item added to cart.", pushResult);
  } catch (error) {
    logger.error("Failed to update cart item", { error });
    HTTPResponse.internalServerError(res, "Could not update cart");
  }
};

export const removeCartItem = async (req: Request, res: Response) => {
  try {
    const { cartId } = req.params;
    const { productId } = req.body;

    logger.info(`${cartId} and ${productId}`);

    if (
      !mongoose.Types.ObjectId.isValid(cartId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      HTTPResponse.badRequest(res, "Invalid Cart ID or Product ID.");
      return;
    }

    const updatedCart = await Cart.findByIdAndUpdate(
      cartId,
      {
        $pull: {
          items: {
            product: productId,
          },
        },
      },
      {
        new: true,
      }
    ).populate("items.product")

    if (!updatedCart) {
      HTTPResponse.notFound(res, "Cart not found.");
      return;
    }

    HTTPResponse.ok(res, "Item removed from cart.", updatedCart);
  } catch (error) {
    logger.error("Failed to update cart item", { error });
    HTTPResponse.internalServerError(res, "Could not update cart");
  }
};
