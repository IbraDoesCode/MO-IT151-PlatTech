import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createProduct,
  getDashboardKPI,
  getProduct,
  getProducts,
  updateProductStatus,
} from "../api/admin";
import type { ProductSearch } from "../validation/productSearch";
import type { ApiError } from "@/types/errors";
import type { ProudctForm } from "../validation/productCreate";

export const dashboardKPIQueryOptions = () =>
  queryOptions({
    queryKey: ["admin", "kpi"],
    queryFn: () => getDashboardKPI(),
  });

export const useDashboardKPI = () => {
  const query = useQuery(dashboardKPIQueryOptions());

  return query;
};

export const productsQueryOptions = (search: ProductSearch) =>
  queryOptions({
    queryKey: ["admin", "products", search],
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
    queryKey: ["admin", "products", productId],
    queryFn: () => getProduct(productId),
  });

export const useProductQuery = (productId: string) => {
  const query = useQuery(productQueryOptions(productId));

  return query;
};

export const useAddProductMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (form: ProudctForm) => createProduct(form),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  return mutation;
};

interface ChangeProductStatusForm {
  id: string;
  status: "active" | "inactive" | "discontinued";
}

export const useChangeProductStatusMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (form: ChangeProductStatusForm) =>
      updateProductStatus(form.id, form.status),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  return mutation;
};
