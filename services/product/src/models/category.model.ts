import { model, Schema } from "mongoose";

interface ICategory {
  slug: string;
  name: string;
}

const categorySchema = new Schema<ICategory>(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true, versionKey: false }
);

const Category = model<ICategory>("category", categorySchema);

export default Category;
