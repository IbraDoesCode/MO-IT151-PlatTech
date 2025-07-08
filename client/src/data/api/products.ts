import type { ProductSearch } from "../validation/productSearch";
import type { Pagination, Response } from "@/types/api";
import { ApiError } from "@/types/errors";
import type { Category, PriceRange, Product, Review } from "@/types/product";
import { BASE_URL } from "../constants/api";

export const getProducts = async (search: ProductSearch) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(search)) {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value !== undefined) {
      params.set(key, value.toString());
    }
  }

  const url = `${BASE_URL}/products?limit=9&${params.toString()}`;

  const res = await fetch(url);

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const message =
      errorData.message || `Request failed with status ${res.status}`;
    throw new ApiError(404, message);
  }

  const data: Response<{ products: Product[] } & Pagination> = await res.json();
  return data;
};

export const getProduct = async (id: string) => {
  const res = await fetch(`${BASE_URL}/products/${id}`);

  const data: Response<Product & { reviews: Review[] }> = await res.json();

  return data;
};

export const searchProducts = async (query: string) => {
  const res = await fetch(`${BASE_URL}/products/autocomplete?q=${query}`);

  const data: Response<Pick<Product, "id" | "name" | "image_url">[]> =
    await res.json();

  return data;
};

export const getCategories = async () => {
  const res = await fetch(`${BASE_URL}/products/categories`);

  const data: Response<Category[]> = await res.json();

  return data;
};

export const getPriceRange = async (
  search: Omit<ProductSearch, "minPrice" | "maxPrice" | "name" | "page">
) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(search)) {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value !== undefined) {
      params.set(key, value.toString());
    }
  }

  const url = `${BASE_URL}/products/price?${params.toString()}`;

  const res = await fetch(url);

  const data: Response<PriceRange> = await res.json();

  return data;
};
