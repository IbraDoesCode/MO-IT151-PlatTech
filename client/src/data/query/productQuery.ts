import { queryOptions, useQuery } from "@tanstack/react-query";
import { getCategories, getProduct, getProducts } from "../api/products-mock";

export const productsQueryOptions = () =>
  queryOptions({
    queryKey: ["products"],
    queryFn: getProducts,
  });

export const useProductsQuery = () => {
  const query = useQuery(productsQueryOptions());

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
