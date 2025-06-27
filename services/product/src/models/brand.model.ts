import { model, Schema } from "mongoose";

interface IBrand {
  name: string;
}

const brandSchema = new Schema<IBrand>(
  { name: { type: String, required: true, unique: true } },
  { timestamps: true, versionKey: false }
);

const Brand = model<IBrand>("brand", brandSchema);

export default Brand;
