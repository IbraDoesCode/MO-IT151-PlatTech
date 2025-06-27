import { Router } from "express";
import {
  createCart,
  deleteCart,
  getCartById,
  removeCartItem,
  updateCart,
  upsertCartItem,
} from "../controllers/cart.controller";

const router = Router();

router.get("/:cartId", getCartById);

router.post("/", createCart);

router.patch("/:cartId", updateCart);
router.patch("/:cartId/item", upsertCartItem);

router.delete("/:cartId", deleteCart);
router.delete("/:cartId/item", removeCartItem);

export default router;
