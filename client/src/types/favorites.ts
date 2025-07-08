import type { Product } from "./product";

export interface FavoriteItem {
  product: Product;
}

export interface Favorite {
  id: string;
  favorites: FavoriteItem[];
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteInput {
  productId: string;
}
