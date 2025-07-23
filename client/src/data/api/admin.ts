import type { Pagination, Response } from "@/types/api";
import { BASE_URL } from "../constants/api";
import type { AdminKPI } from "@/types/admin";
import type { ProductSearch } from "../validation/productSearch";
import { ApiError } from "@/types/errors";
import type { Product, Review } from "@/types/product";
import type { ProudctForm } from "../validation/productCreate";

export const getDashboardKPI = async () => {
  const res = await fetch(`${BASE_URL}/admin/kpi`);

  const data: Response<AdminKPI> = await res.json();

  return data;
};

export const getProducts = async (search: ProductSearch) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(search)) {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value !== undefined) {
      params.set(key, value.toString());
    }
  }

  const url = `${BASE_URL}/admin/products?limit=10&${params.toString()}`;

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
  const res = await fetch(`${BASE_URL}/admin/products/${id}`);

  const data: Response<Product & { reviews: Review[] }> = await res.json();

  return data;
};

export const createProduct = async (form: ProudctForm) => {
  const formData = new FormData();

  form.images.forEach((file) => {
    formData.append("images", file);
  });

  formData.append("name", form.name);
  formData.append("category", form.category);
  formData.append("brand", form.brand || "");
  formData.append("description", form.description);
  formData.append("price", String(form.price));
  formData.append("quantity", String(form.quantity));
  formData.append("image_url", form.imageLink || "");

  const res = await fetch(`${BASE_URL}/admin/products`, {
    method: "POST",
    body: formData,
  });

  const data: Response<Product> = await res.json();

  return data;
};

export const updateProduct = async (id: string, form: ProudctForm) => {
  const formData = new FormData();

  form.images.forEach((file) => {
    formData.append("images", file);
  });

  formData.append("name", form.name);
  formData.append("category", form.category);
  formData.append("brand", form.brand || "");
  formData.append("description", form.description);
  formData.append("price", String(form.price));
  formData.append("quantity", String(form.quantity));
  formData.append("image_url", form.imageLink || "");

  const res = await fetch(`${BASE_URL}/admin/products/${id}`, {
    method: "PATCH",
    body: formData,
  });

  const data: Response<Product> = await res.json();

  return data;
};

export const updateProductStatus = async (
  id: string,
  status: "active" | "inactive" | "discontinued"
) => {
  const formData = new FormData();

  formData.append("status", status);

  const res = await fetch(`${BASE_URL}/admin/products/${id}`, {
    method: "PATCH",
    body: formData,
  });

  const data: Response<Product> = await res.json();

  return data;
};

export const deleteProduct = async (id: string) => {
  const res = await fetch(`${BASE_URL}/admin/products/${id}`, {
    method: "DELETE",
  });

  const data: Response<Product> = await res.json();

  return data;
};
