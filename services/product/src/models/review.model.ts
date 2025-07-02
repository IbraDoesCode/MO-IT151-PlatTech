import mongoose, { model, Schema } from "mongoose";

export interface IReview {
  product: mongoose.Types.ObjectId;
  name: string;
  email: string;
  rating: number;
  comment: string;
  date: string;
}

const reviewSchema = new Schema<IReview>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
  },
  {
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

const Review = model<IReview>("review", reviewSchema);

export default Review;
