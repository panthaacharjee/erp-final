import { Model, Schema, model } from "mongoose";

interface ICounter extends Document {
  id: string;
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  id: { type: String, required: true },
  seq: { type: Number, default: 1 },
});

const ProductCounter: Model<ICounter> = model<ICounter>(
  "Product_Counter",
  counterSchema
);

export default ProductCounter;
