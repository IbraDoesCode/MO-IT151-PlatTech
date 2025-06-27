import { Router } from "express";
import {
  createCart,
  getCartById,
  updateCart,
} from "../controllers/cart.controller";

const router = Router();

router.get("/:id", getCartById);

router.post("/", createCart);

router.patch("/:id", updateCart);

export default router;
