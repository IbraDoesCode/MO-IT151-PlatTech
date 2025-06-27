import mongoose, { Schema, model } from "mongoose";
// This fixes the "brand" is not registered or something
import "../models/brand.model";
import "../models/category.model";

interface IProduct {
  name: string;
  brand: mongoose.Types.ObjectId;
  description: string;
  category: mongoose.Types.ObjectId;
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
      type: Schema.Types.ObjectId,
      ref: "brand",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "category",
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

        // Since these are refs, put the proper name instead of the obj
        if (ret.brand && typeof ret.brand == "object") {
          ret.brand = ret.brand.name;
        }

        if (ret.category && typeof ret.category == "object") {
          ret.category = ret.category.slug;
        }

        return ret;
      },
    },
  }
);

// --- Middleware ---
function autoPopulate(this: any, next: any) {
  this.populate("brand").populate("category");
  next();
}

productSchema
  .pre("find", autoPopulate)
  .pre("findOne", autoPopulate)
  .pre("findOneAndUpdate", autoPopulate)
  .pre("findOneAndDelete", autoPopulate);

const Product = model<IProduct>("product", productSchema);

export default Product;
