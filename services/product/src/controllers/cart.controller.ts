import { Request, Response } from "express";
import logger from "../utils/logger";
import { HTTPResponse } from "../utils/http-response";
import Cart, { ICart } from "../models/cart.model";
import mongoose from "mongoose";

// valid user id:
// 685de027e9ae7f83b7f143d0

// valid cart id:
// 685de053a523cbafa6fe847d

export const createCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body || {};

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      HTTPResponse.badRequest(res, "Invalid user ID.");
      return;
    }

    // Even if the userId doesn't exist, proceed with creation
    const cartData: ICart = { items: [] };

    if (userId) cartData.userId = userId;

    // Create the cart session
    const newCart = new Cart(cartData);

    const savedCart = await newCart.save();

    HTTPResponse.ok(res, "Successfully created cart.", savedCart);
  } catch (error) {
    logger.error("An unexpected error has occurred", error);
    HTTPResponse.internalServerError(res, "Internal server error", error);
  }
};

export const getCartById = async (req: Request, res: Response) => {
  try {
    const { cartId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cartId)) {
      HTTPResponse.badRequest(res, "Invalid Cart ID.");
      return;
    }

    const cart = await Cart.findById(cartId).populate("items.product");

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
    const { cartId } = req.params;
    const { items } = req.body;

    if (!mongoose.Types.ObjectId.isValid(cartId)) {
      HTTPResponse.badRequest(res, "Invalid Cart ID.");
      return;
    }

    const updatedCart = await Cart.findByIdAndUpdate(
      cartId,
      {
        items,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("items.product");

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
    const { cartId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cartId)) {
      HTTPResponse.badRequest(res, "Invalid Cart ID.");
      return;
    }

    const deletedCart = await Cart.findByIdAndDelete(cartId);

    if (!deletedCart) {
      HTTPResponse.notFound(res, "Cart not found.");
      return;
    }

    HTTPResponse.ok(res, "Cart deleted", cartId);
  } catch (error) {
    logger.error("Failed to delete cart", { error });
    HTTPResponse.internalServerError(res, "Could not delete cart");
  }
};

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
    ).populate("items.product");

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
