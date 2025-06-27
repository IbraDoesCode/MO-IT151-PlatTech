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

  const category = await Category.findOneAndUpdate(
    { slug },
    {
      $setOnInsert: { name }, // Only set name if inserting
    },
    { upsert: true, new: true }
  );

  return category;
};

export const resolveValueToObjectId = async (
  model: any,
  field: string,
  value: string
) => {
  const query = {
    [field]: { $regex: value, $options: "i" },
  };

  const doc = await model.findOne(query);
  return doc ? doc._id : null;
};
