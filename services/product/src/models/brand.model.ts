import { model, Schema } from "mongoose";

interface IBrand {
  name: string;
}

const brandSchema = new Schema<IBrand>(
  { name: { type: String, required: true, unique: true } },
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

const Brand = model<IBrand>("brand", brandSchema);

export default Brand;
