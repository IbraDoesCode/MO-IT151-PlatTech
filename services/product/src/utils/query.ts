import Brand from "../models/brand.model";
import Category from "../models/category.model";
import { IProduct } from "../models/product.model";
import { resolveValueToObjectId } from "./resolveRefs";

export interface IProductsFilter
  extends Omit<IProduct, "description" | "image_url" | "brand" | "category"> {
  brand: string;
  category: string;
  minPrice: string;
  maxPrice: string;
}

export const productsFilters = async (query: Partial<IProductsFilter>) => {
  const filters: Record<string, any> = {};

  if (query.name) filters.name = { $regex: query.name, $options: "i" };
  if (query.brand)
    filters.brand = await resolveValueToObjectId(Brand, "name", query.brand);
  if (query.category)
    filters.category = await resolveValueToObjectId(
      Category,
      "name",
      query.category
    );
  if (query.minPrice && query.maxPrice) {
    const minPrice = Number(query.minPrice);
    const maxPrice = Number(query.maxPrice);
    filters.price = { $gte: minPrice, $lte: maxPrice };
  }
  if (query.rating) {
    const rating = Number(query.rating);
    filters.rating = { $gte: rating, $lt: rating + 1 };
  }

  return filters;
};
