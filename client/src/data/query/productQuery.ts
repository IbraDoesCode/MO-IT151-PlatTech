import { queryOptions, useQuery } from "@tanstack/react-query";
import {
  getCategories,
  getPriceRange,
  getProduct,
  getProducts,
} from "../api/products";
import type { ProductSearch } from "../validation/productSearch";
import type { ApiError } from "@/types/errors";

export const productsQueryOptions = (search: ProductSearch) =>
  queryOptions({
    queryKey: ["products", search],
    queryFn: () => getProducts(search),
    retry: (failCount, error) => {
      const err = error as ApiError;

      if (err.status === 404) {
        return false;
      }

      return failCount < 3;
    },
  });

export const useProductsQuery = (search: ProductSearch) => {
  const query = useQuery(productsQueryOptions(search));

  return query;
};

export const productQueryOptions = (productId: string) =>
  queryOptions({
    queryKey: ["products", productId],
    queryFn: () => getProduct(productId),
  });

export const useProductQuery = (productId: string) => {
  const query = useQuery(productQueryOptions(productId));

  return query;
};

export const categoriesQueryOptions = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

export const useCategoriesQuery = () => {
  const query = useQuery(categoriesQueryOptions());

  return query;
};

export const priceRangeQueryOptions = (
  search: Omit<ProductSearch, "minPrice" | "maxPrice" | "name" | "page">
) =>
  queryOptions({
    queryKey: ["price-range", search],
    queryFn: () => getPriceRange(search),
  });

export const usePriceRangeQuery = (
  search: Omit<ProductSearch, "minPrice" | "maxPrice" | "name" | "page">
) => {
  const query = useQuery(priceRangeQueryOptions(search));

  return query;
};
