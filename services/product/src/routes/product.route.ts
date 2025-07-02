import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCategories,
  getProductBrands,
  getProductPriceRange,
} from "../controllers/product.controller";

const router = Router();

// Get routes
router.get("/", getProducts);
router.get("/categories", getProductCategories);
router.get("/brands", getProductBrands);
router.get("/price", getProductPriceRange);
router.get("/:id", getProductById);

// Post route
router.post("/", createProduct);

// Patch route
router.patch("/:id", updateProduct);

// Delete route
router.delete("/:id", deleteProduct);
export default router;
