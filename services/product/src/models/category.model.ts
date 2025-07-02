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
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: function (_doc, ret) {
        if (ret._id) {
          ret.id = ret._id.toString();
        }
        delete ret._id;

        return ret;
      },
    },
  }
);

const Category = model<ICategory>("category", categorySchema);

export default Category;
