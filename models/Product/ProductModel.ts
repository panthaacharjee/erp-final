import { Document, model, Schema, Types } from "mongoose";

export interface productDetails {
  p_id: string;
  season: string;
  status: boolean;
  recieve: Date;

  process: Types.ObjectId[] | productProcess;

  contactDetails: {
    buyer: string;
    vendor: string;
    contact: string;
    sales: string;
  };
  product: {
    line: string;
    category: string;
    desc: string;
    code: string;
    hs_code: string;
    ref: string;
  };

  dimensionDetails: {
    page: {
      title: string;
      value: string;
    };
    set: string;
    measure: {
      width: number;
      height: number;
      length: number;
      dimension_unit: string;
    };
  };
  weight: {
    per_pcs: number;
    weight_value: number;
    weight_unit: string;
  };
  quantity: {
    unit_type: string;
    moq: number;
    moq_unit: string;
  };
  price: {
    last_price: Date;
    currency: string;
    price_unit: string;
    full_part: number;
    half_part: number;
  };
  sample_submission: {
    date: Date;
    buyer_comment: string;
  };

  aproved_sample: {
    url: string;
    public_id: string;
  };
}

export interface productProcess {
  serial: string;
  name: string;
  spec: [
    {
      name: string;
      value: number;
      serial: [
        {
          name: string;
          value: string;
        }
      ];
    }
  ];
}

const productSchema = new Schema<productDetails>({
  p_id: {
    type: String,
  },
  status: {
    type: Boolean,
    default: false,
  },
  season: {
    type: String,
  },
  recieve: {
    type: Date,
  },

  process: [
    {
      type: Schema.Types.ObjectId,
    },
  ],

  contactDetails: {
    buyer: String,
    vendor: String,
    contact: String,
    sales: String,
  },

  product: {
    line: String,
    category: String,
    desc: String,
    code: String,
    hs_code: String,
    ref: String,
  },

  dimensionDetails: {
    page: String,
    set: Boolean,
    measure: {
      width: Number,
      height: Number,
      length: Number,
      dimension_unit: String,
    },
  },
  weight: {
    per_pcs: Number,
    weight_value: Number,
    weight_unit: String,
  },
  quantity: {
    unit_type: String,
    moq: Number,
    moq_unit: String,
  },
  price: {
    last_price: Date,
    currency: String,
    price_unit: String,
    full_part: Number,
    half_part: Number,
  },
  sample_submission: {
    date: Date,
    buyer_comment: String,
  },

  aproved_sample: {
    url: String,
    public_id: String,
  },
});

export default model<productDetails>("product", productSchema);
