import type { Favorite } from "@/types/favorites";
import { BASE_URL } from "../constants/api";
import type { Response } from "@/types/api";
import { ApiError } from "@/types/errors";

export const createFavorites = async () => {
  const res = await fetch(`${BASE_URL}/favorites`, { method: "POST" });

  const data: Response<string> = await res.json();

  return data;
};

export const getFavorites = async (id: string) => {
  const res = await fetch(`${BASE_URL}/favorites/${id}`);

  const data: Response<Favorite> = await res.json();

  return data;
};

export const toggleFavorties = async (
  favoritesId: string,
  productId: string
) => {
  const res = await fetch(`${BASE_URL}/favorites/${favoritesId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId: productId,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const message =
      errorData.message || `Request failed with status ${res.status}`;
    throw new ApiError(404, message);
  }

  const data: Response<Favorite> = await res.json();

  return data;
};
