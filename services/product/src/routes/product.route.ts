import { Router } from "express";
import {
  getProducts,
  getProductById,
  getProductByName,
} from "../controllers/product.controller";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.get("/by-name/:name", getProductByName);
export default router;
