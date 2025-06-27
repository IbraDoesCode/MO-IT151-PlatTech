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

export const resolveCategory = async (name: string) => {
  const category = await Category.findOneAndUpdate(
    {
      name,
    },
    { name },
    { upsert: true, new: true }
  );

  return category;
};
