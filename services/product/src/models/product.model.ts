import { Schema, model } from "mongoose";

interface IProduct {
  name: string;
  brand: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  image_url: string;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      requierd: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    image_url: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: function (_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

const Product = model<IProduct>("product", productSchema);

export default Product;
