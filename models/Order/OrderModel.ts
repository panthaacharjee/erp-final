import { Document, model, Types, Schema } from "mongoose";

export interface IOrderdetails {
  orderId: string;
  orderDate: Date;
  user: Types.ObjectId[];

  status: {
    mode: String;
    user: Types.ObjectId[];
    batchJob: string;
  };
  booking: {
    public_id: string;
    url: string;
    upload_date: Date;
  };
  artwork: {
    public_id: string;
    url: string;
    upload_date: Date;
  };

  contactDetails: {
    buyer: string;
    vendor: string;
    buyerRef: string;
    vendorRef: string;
    contact: string;
    sales: string;
    req_date: Date;
    season: string;
  };

  orderDetails: [
    {
      product: Types.ObjectId;
      serial: string;
      line: string;
      category: string;
      desc: string;
      model: string;
      item_pact_art: string;
      style_cc_iman: string;
      variable: string;
      gmts_color: string;
      size_age: string;
      ean_number: string;
      order_qty: number;
      order_unit: string;
      page_part: number;
      base_qty_full_part: number;
      base_qty_half_part: number;
    }
  ];
}

const orderSchema = new Schema<IOrderdetails>({
  orderId: {
    type: String,
  },
  orderDate: {
    type: Date,
  },
  user: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  status: {
    mode: {
      type: String,
    },
    batchJob: {
      type: String,
    },
    user: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  booking: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
    upload_date: {
      type: Date,
    },
  },
  artwork: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },

  contactDetails: {
    buyer: String,
    vendor: String,
    buyerRef: String,
    vendorRef: String,
    contact: String,
    sales: String,
    req_date: Date,
    season: String,
  },
  orderDetails: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "product",
      },
      serial: String,
      line: String,
      category: String,
      desc: String,
      model: String,
      item_pact_art: String,
      style_cc_iman: String,
      variable: String,
      gmts_color: String,
      size_age: String,
      ean_number: String,
      order_qty: Number,
      order_unit: String,
      page_part: Number,
      base_qty_full_part: Number,
      base_qty_half_part: Number,
    },
  ],
});

export const Order = model<IOrderdetails>("order", orderSchema);
