import { Document, model, Schema, Types } from "mongoose";
import { IBuyer, IVendor } from "./ContactDetails";

export interface ILineCategory extends Document {
  line: Types.ObjectId[];
  category: string;
  code: string;
}

export interface ILine extends Document {
  name: string;
  code: string;
  others: string;
  category: Types.ObjectId[];
  process: Types.ObjectId[];
}

export interface IProcess extends Document {
  title: string;
  details: boolean;
  information: string;
  spec: Types.ObjectId[];
}

export interface ISpecification extends Document {
  title: string;
  serial: Types.ObjectId[];
}
export interface ISerial extends Document {
  title: string;
  item: Types.ObjectId[];
}
export interface IItem extends Document {
  title: string;
}

export interface IProgram_Season extends Document {
  buyer: Types.ObjectId | IBuyer;
  name: string;
  vendor: Types.ObjectId | IVendor;
}

const lineSchema = new Schema<ILine>({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  others: {
    type: String,
  },
  category: [
    {
      type: Schema.Types.ObjectId,
      ref: "category",
    },
  ],
  process: [
    {
      type: Schema.Types.ObjectId,
      ref: "process_product",
    },
  ],
});

const categorySchema = new Schema<ILineCategory>({
  category: {
    type: String,
  },
  code: {
    type: String,
  },
});

const processSchema = new Schema<IProcess>({
  title: {
    type: String,
  },
  details: {
    type: Boolean,
    default: false,
  },
  information: {
    type: String,
  },
  spec: [
    {
      type: Schema.Types.ObjectId,
      ref: "specification",
    },
  ],
});

const specSchema = new Schema<ISpecification>({
  title: {
    type: String,
  },
  serial: [
    {
      type: Schema.Types.ObjectId,
      ref: "serial",
    },
  ],
});

const serialSchema = new Schema<ISerial>({
  title: {
    type: String,
  },
  item: [
    {
      type: Schema.Types.ObjectId,
      ref: "item",
    },
  ],
});

const itemSchema = new Schema<IItem>({
  title: {
    type: String,
  },
});

const programSchema = new Schema<IProgram_Season>({
  buyer: {
    type: Schema.Types.ObjectId,
    ref: "Buyer",
  },
  name: {
    type: String,
  },
  vendor: {
    type: String,
  },
});

export const lineModel = model<ILine>("product_line", lineSchema);
export const categoryModel = model<ILineCategory>("category", categorySchema);
export const processModel = model<IProcess>("process_product", processSchema);
export const specModel = model<ISpecification>("specification", specSchema);
export const serialModel = model<ISerial>("serial", serialSchema);
export const itemModel = model<IItem>("item", itemSchema);
export const programModel = model<IProgram_Season>("program", programSchema);
