import { Router } from "express";
import {
  getProducts,
  getProductById,
  getProductByName,
  createProduct,
} from "../controllers/product.controller";

const router = Router();

// Get routes
router.get("/", getProducts);
router.get("/:id", getProductById);
router.get("/by-name/:name", getProductByName);

// Post routes
router.post("/", createProduct);
export default router;
