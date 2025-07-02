import type { ApiError } from "@/types/errors";
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getCart, upsertCart } from "../api/cart";
import type { CartInput } from "@/types/cart";

export const cartQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["cart"],
    queryFn: () => getCart(id),
    retry: (failCount, error) => {
      const err = error as ApiError;

      if (err.status === 404) {
        return false;
      }

      return failCount < 3;
    },
  });

export const useCartQuery = (id: string) => {
  const query = useQuery(cartQueryOptions(id));

  return query;
};

export const useCartMutation = (cartId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: CartInput) =>
      upsertCart(cartId, input.productId, input.quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  return mutation;
};
