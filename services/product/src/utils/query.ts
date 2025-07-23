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

  // Query for multiple brands if more than one
  if (query.brand) {
    const brands = Array.isArray(query.brand) ? query.brand : [query.brand];
    const brandIds = await Promise.all(
      brands.map((name) => resolveValueToObjectId(Brand, "name", name))
    );
    const filterBrandsIds = brandIds.filter((id) => id);
    if (filterBrandsIds.length > 0) {
      filters.brand = { $in: filterBrandsIds };
    }
  }

  if (query.category) {
    const categories = Array.isArray(query.category)
      ? query.category
      : [query.category];
    const categoryIds = await Promise.all(
      categories.map((name) => resolveValueToObjectId(Category, "name", name))
    );
    const filteredCategoryIds = categoryIds.filter((id) => id);
    if (filteredCategoryIds.length > 0) {
      filters.category = { $in: filteredCategoryIds };
    }
  }

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

export interface IPriceRangeFilter
  extends Omit<
    IProduct,
    "name" | "description" | "image_url" | "brand" | "category"
  > {
  brand: string;
  category: string;
}

export const priceRangeFilters = async (query: Partial<IPriceRangeFilter>) => {
  const filters: Record<string, any> = {};

  // Query for multiple brands if more than one
  if (query.brand) {
    const brands = Array.isArray(query.brand) ? query.brand : [query.brand];
    const brandIds = await Promise.all(
      brands.map((name) => resolveValueToObjectId(Brand, "name", name))
    );
    const filterBrandsIds = brandIds.filter((id) => id);
    if (filterBrandsIds.length > 0) {
      filters.brand = { $in: filterBrandsIds };
    }
  }

  if (query.category) {
    const categories = Array.isArray(query.category)
      ? query.category
      : [query.category];
    const categoryIds = await Promise.all(
      categories.map((name) => resolveValueToObjectId(Category, "name", name))
    );
    const filteredCategoryIds = categoryIds.filter((id) => id);
    if (filteredCategoryIds.length > 0) {
      filters.category = { $in: filteredCategoryIds };
    }
  }

  if (query.rating) {
    const rating = Number(query.rating);
    filters.rating = { $gte: rating, $lt: rating + 1 };
  }

  return filters;
};
