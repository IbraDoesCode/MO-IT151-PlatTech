import { model, Schema, Types } from "mongoose";

interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
}

export interface ICart {
  items: ICartItem[];
  userId?: Types.ObjectId;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  { _id: false }
);

const cartSchema = new Schema<ICart>(
  {
    items: [cartItemSchema],
    userId: {
      type: Schema.Types.ObjectId,
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

const Cart = model<ICart>("cart", cartSchema);
export default Cart;
