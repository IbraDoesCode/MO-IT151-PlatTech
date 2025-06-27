import { Router } from "express";
import {
  removeCartItem,
  upsertCartItem,
} from "../controllers/cartItem.controller";

const router = Router();

router.patch("/:cartId/items", upsertCartItem);

router.delete("/:cartId/items", removeCartItem);

export default router;
