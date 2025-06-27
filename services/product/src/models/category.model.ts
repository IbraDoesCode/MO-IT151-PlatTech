import { model, Schema } from "mongoose";

interface ICategory {
  name: string;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true, versionKey: false }
);

const Category = model<ICategory>("category", categorySchema);

export default Category;
