import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
} from "../controllers/product.controller";

const router = Router();

// Get routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Post routes
router.post("/", createProduct);

// Patch routes
router.patch("/:id", updateProduct);
export default router;
