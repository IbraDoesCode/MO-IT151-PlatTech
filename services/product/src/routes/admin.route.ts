import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getDashboardKPI,
  getProducts,
  updateProduct,
} from "../controllers/admin.controller";
import { upload } from "../middleware/upload";

const router = Router();
router.get("/kpi", getDashboardKPI);
router.get("/products", getProducts);

// Post route
router.post("/products", upload.array("images", 4), createProduct);

// Patch route
router.patch("/products/:id", upload.array("images", 4), updateProduct);

// Delete route
router.delete("/products/:id", deleteProduct);

export default router;
