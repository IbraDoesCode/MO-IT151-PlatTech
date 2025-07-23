import type { Cart } from "@/types/cart";
import { BASE_URL } from "../constants/api";
import type { Response } from "@/types/api";
import { ApiError } from "@/types/errors";

export const createCart = async () => {
  const res = await fetch(`${BASE_URL}/cart`, { method: "POST" });

  const data: Response<Cart> = await res.json();

  return data;
};

export const getCart = async (id: string) => {
  const res = await fetch(`${BASE_URL}/cart/${id}`);

  const data: Response<Cart> = await res.json();

  return data;
};

export const upsertCart = async (
  cartId: string,
  productId: string,
  quantity: number
) => {
  const res = await fetch(`${BASE_URL}/cart/${cartId}/item`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId: productId,
      quantity: quantity,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const message =
      errorData.message || `Request failed with status ${res.status}`;
    throw new ApiError(404, message);
  }

  const data: Response<Cart> = await res.json();

  return data;
};
