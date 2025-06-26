import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";

const router = Router();

// Get routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Post route
router.post("/", createProduct);

// Patch route
router.patch("/:id", updateProduct);

// Delete route
router.delete("/:id", deleteProduct);
export default router;
