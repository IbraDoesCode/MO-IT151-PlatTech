import { Router } from "express";
import {
  createCart,
  deleteCart,
  getCartById,
  updateCart,
} from "../controllers/cart.controller";

const router = Router();

router.get("/:id", getCartById);

router.post("/", createCart);

router.patch("/:id", updateCart);

router.delete("/:id", deleteCart);

export default router;
