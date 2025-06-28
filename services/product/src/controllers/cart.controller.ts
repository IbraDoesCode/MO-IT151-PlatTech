import { Request, Response } from "express";
import logger from "../utils/logger";
import { HTTPResponse } from "../utils/http-response";
import Cart, { ICart } from "../models/cart.model";
import mongoose, { HydratedDocument } from "mongoose";
import Product, { IProduct } from "../models/product.model";
import { invalidateProductCache } from "../utils/cache";

// valid user id:
// 685de027e9ae7f83b7f143d0

// valid cart id:
// 685de053a523cbafa6fe847d

/**
 * Create a new cart.
 *
 * @route POST /cart
 * @param req.body.userId (string, optional) - User's ObjectId
 * @returns 200 with created cart, 400 if invalid userId
 *
 * Creates a new cart document, optionally associated with a user.
 */
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

/**
 * Get a cart by its ObjectId.
 *
 * @route GET /cart/:cartId
 * @param req.params.cartId - The cart's ObjectId (string)
 * @returns 200 with cart, 400 if invalid id, 404 if not found
 *
 * Populates product details in cart items.
 */
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

/**
 * Update the items in a cart.
 *
 * @route PUT /cart/:cartId
 * @param req.params.cartId - The cart's ObjectId (string)
 * @param req.body.items - Array of cart items to set
 * @returns 200 with updated cart, 400 if invalid id, 404 if not found
 *
 * Replaces the cart's items array with the provided items.
 */
export const updateCart = async (req: Request, res: Response) => {
  try {
    const { cartId } = req.params;
    const { items } = req.body;

    if (!mongoose.Types.ObjectId.isValid(cartId)) {
      HTTPResponse.badRequest(res, "Invalid Cart ID.");
      return;
    }

    // Get all product IDs from items
    const productIds = items.map((item: any) => item.product);

    // Fetch all required products at once
    const products = await Product.find({ _id: { $in: productIds } }).lean();

    // Create a map for quick lookup
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    for (const item of items) {
      const product = productMap.get(item.product);
      if (!product) {
        HTTPResponse.notFound(res, `Product not found: ${item.product}`);
        return;
      }

      if (item.quantity == 0) {
        HTTPResponse.badRequest(
          res,
          `Quantity for product ${product.name} cannot be 0.`
        );
        return;
      }

      if (item.quantity > product.quantity) {
        HTTPResponse.badRequest(
          res,
          `Quantity for product ${product.name} exceeds available stock (${product.quantity}).`
        );
        return;
      }
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

/**
 * Delete a cart by its ObjectId.
 *
 * @route DELETE /cart/:cartId
 * @param req.params.cartId - The cart's ObjectId (string)
 * @returns 200 if deleted, 400 if invalid id, 404 if not found
 */
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

/**
 * Add or update a cart item (upsert).
 *
 * @route PUT /cart/:cartId/item
 * @param req.params.cartId - The cart's ObjectId (string)
 * @param req.body.productId - The product's ObjectId (string)
 * @param req.body.quantity - The quantity to set (number)
 * @returns 200 with updated cart, 400 if invalid ids, 404 if not found
 *
 * If quantity is 0, removes the item. If item exists, updates quantity. Otherwise, adds new item.
 */
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

    // Validate stock quantity
    const product = await Product.findById(productId);
    if (!product) {
      HTTPResponse.notFound(res, "Product not found.");
      return;
    }

    if (quantity > product.quantity) {
      HTTPResponse.badRequest(
        res,
        `Cannot add more than ${product.quantity} item(s) for this product.`
      );
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

/**
 * Remove a specific item from the cart.
 *
 * @route DELETE /cart/:cartId/items
 * @param req.params.cartId - The cart's ObjectId (string)
 * @param req.body.productId - The product's ObjectId (string)
 * @returns 200 with updated cart, 400 if invalid ids, 404 if not found
 */
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

export const checkoutCart = async (req: Request, res: Response) => {
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

    if (cart.items.length === 0) {
      HTTPResponse.badRequest(res, "Cart is empty. Nothing to checkout.");
      return;
    }

    // Validate stock first
    const outOfStockItems = cart.items.filter((item) => {
      const product = item.product as unknown as HydratedDocument<IProduct>;
      return item.quantity > product.quantity;
    });

    if (outOfStockItems.length > 0) {
      const names = outOfStockItems
        .map(
          (item) => (item.product as unknown as HydratedDocument<IProduct>).name
        )
        .join(", ");
      HTTPResponse.badRequest(res, `Insufficient stock for: ${names}`);
      return;
    }

    // Deduct stock quantities
    const bulkOps = cart.items.map((item) => ({
      updateOne: {
        filter: { _id: item.product._id },
        update: { $inc: { quantity: -item.quantity } },
      },
    }));

    await Product.bulkWrite(bulkOps);

    // Invalidate cache for all affected products
    const productIds = cart.items.map((item) => item.product.id.toString());
    await invalidateProductCache(productIds);

    // Optionally clear the cart after checkout
    cart.items = [];
    await cart.save();

    HTTPResponse.ok(res, "Checkout successful. Product stock updated.", cart);
  } catch (error) {
    logger.error("Failed to checkout cart", { error });
    HTTPResponse.internalServerError(res, "Checkout failed", error);
  }
};
