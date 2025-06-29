import { Router } from "express";
import {
  createFavorite,
  deleteFavorite,
  getFavoriteById,
  toggleUpdateFavorite,
} from "../controllers/favorite.controller";

const router = Router();

router.get("/:favoriteId", getFavoriteById);

router.post("/", createFavorite);

router.patch("/:favoriteId", toggleUpdateFavorite);

router.delete("/:favoriteId", deleteFavorite);

export default router;
