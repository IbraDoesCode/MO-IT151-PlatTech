import { model, Schema, Types } from "mongoose";

interface IFavoriteItem {
  product: Types.ObjectId;
}

export interface IFavorite {
  favorites: IFavoriteItem[];
  quantity: number;
}

const favoriteItemSchema = new Schema<IFavoriteItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
  },
  { _id: false }
);

const favoriteSchema = new Schema<IFavorite>(
  {
    favorites: [favoriteItemSchema],
    quantity: {
      type: Number,
      default: 0,
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

const Favorite = model<IFavorite>("favorite", favoriteSchema);
export default Favorite;
