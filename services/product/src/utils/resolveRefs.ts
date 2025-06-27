import Brand from "../models/brand.model";
import Category from "../models/category.model";

export const resolveBrand = async (name: string) => {
  const brand = await Brand.findOneAndUpdate(
    {
      name,
    },
    { name },
    { upsert: true, new: true }
  );

  return brand;
};

export const resolveCategory = async (slug: string) => {
  const name = slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

  const url = `http://localhost:3000/product?category=${slug}`;

  const category = await Category.findOneAndUpdate(
    { slug },
    {
      $setOnInsert: { name, url }, // Only set name and url if inserting
    },
    { upsert: true, new: true }
  );

  return category;
};
