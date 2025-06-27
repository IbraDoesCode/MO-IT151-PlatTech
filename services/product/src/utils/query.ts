import Brand from "../models/brand.model";
import Category from "../models/category.model";
import { resolveValueToObjectId } from "./resolveRefs";

export const productsFilters = async (query: any) => {
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
  if (query.price) filters.price = Number(query.price);
  if (query.rating) {
    const rating = Number(query.rating);
    filters.rating = { $gte: rating, $lt: rating + 1 };
  }

  return filters;
};
