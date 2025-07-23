import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getFavorites, toggleFavorties } from "../api/favorites";
import type { ApiError } from "@/types/errors";
import type { FavoriteInput } from "@/types/favorites";

export const favortiesQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["favorites"],
    queryFn: () => getFavorites(id),
    retry: (failCount, error) => {
      const err = error as ApiError;

      if (err.status === 404) {
        return false;
      }

      return failCount < 3;
    },
  });

export const useFavoritesQuery = (id: string) => {
  const query = useQuery(favortiesQueryOptions(id));

  return query;
};

export const useFavoritesMutation = (favoritesId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: FavoriteInput) =>
      toggleFavorties(favoritesId, input.productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  return mutation;
};
