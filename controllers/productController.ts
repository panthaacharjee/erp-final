import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorhandler";
const catchAsyncError = require("../middleware/catchAsyncError");
import { Product, Process } from "../models/Product/ProductModel";
import ProductCounter from "../models/Product/ProductSerial";

exports.createProduct = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      p_id,
      recieve,

      buyer,
      vendor,
      contact,
      sales,

      line,
      category,
      desc,
      ref,
      code,
      hs_code,

      height,
      width,
      length,
      dimension_unit,
      page_part,
      set,

      weight,
      weight_per_pcs,
      weight_unit,

      order_unit,
      moq,
      moq_unit,

      last_price,
      currency,
      full_part,
      half_part,
      price_unit,

      sample_date,
      comments,
    }: {
      p_id: string;
      recieve: Date;

      buyer: string;
      vendor: string;
      contact: string;
      sales: string;

      line: string;
      category: string;
      desc: string;
      ref: string;
      code: string;
      hs_code: string;

      height: number;
      width: number;
      length: number;
      dimension_unit: string;
      page_part: string;
      set: boolean;

      weight: number;
      weight_per_pcs: string;
      weight_unit: string;

      order_unit: string;
      moq: number;
      moq_unit: string;

      last_price: Date;
      currency: string;
      full_part: number;
      half_part: number;
      price_unit: string;

      sample_date: Date;
      comments: string;
    } = req.body;

    if (p_id === "") {
      return next(ErrorHandler("PRODUCT ID IS REQUIRED", 404, res, next));
    }

    const productIdProvider = (props: number) => {
      if (props < 10) {
        return `PID/${new Date(Date.now()).getFullYear()}/0000${props}`;
      } else if (props < 100) {
        return `PID/${new Date(Date.now()).getFullYear()}/000${props}`;
      } else if (props < 1000) {
        return `PID/${new Date(Date.now()).getFullYear()}/00${props}`;
      } else if (props < 10000) {
        return `PID/${new Date(Date.now()).getFullYear()}/0${props}`;
      } else {
        return `Employee-${props}`;
      }
    };

    const product = await Product.findOne({ p_id });

    if (product) {
      const updateProduct = await Product.findByIdAndUpdate(
        product?._id,
        {
          recieve: new Date(recieve),

          contactDetails: {
            buyer: buyer,
            vendor: vendor,
            contact: contact,
            sales: sales,
          },

          product: {
            line: line,
            category: category,
            desc: desc,
            code: code,
            hs_code: hs_code,
            ref: ref,
          },

          dimensionDetails: {
            page: page_part,
            set: set,
            measure: {
              width: width,
              height: height,
              length: length,
              dimension_unit: dimension_unit,
            },
          },
          weight: {
            per_pcs: weight_per_pcs,
            weight_value: weight,
            weight_unit: weight_unit,
          },
          quantity: {
            unit_type: order_unit,
            moq: moq,
            moq_unit: moq_unit,
          },
          price: {
            last_price: last_price,
            currency: currency,
            price_unit: price_unit,
            full_part: full_part,
            half_part: half_part,
          },
          sample_submission: {
            date: sample_date,
            buyer_comment: comments,
          },
        },
        {
          new: true,
          runValidators: true,
          useFindAndModify: false,
        }
      );

      const updatedProduct = await Product.findById(
        updateProduct?._id
      ).populate("process");
      res.status(200).json({
        success: true,
        message: "SUCCESSFULLY PRODUCT UPDATE",
        product: updatedProduct,
      });
    } else {
      if (p_id === "") {
        return next(ErrorHandler("PRODUCT ID IS REQUIRED", 500, res, next));
      } else if (p_id === "New") {
        const counter = await ProductCounter.findOneAndUpdate(
          { id: "aval" },
          { $inc: { seq: 1 } },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          }
        );

        const productId = productIdProvider(counter.seq);

        const product = await Product.create({
          p_id: productId,
          recieve: recieve,

          contactDetails: {
            buyer: buyer,
            vendor: vendor,
            contact: contact,
            sales: sales,
          },

          product: {
            line: line,
            category: category,
            desc: desc,
            code: code,
            hs_code: hs_code,
            ref: ref,
          },

          dimensionDetails: {
            page: page_part,
            set: set,
            measure: {
              width: width,
              height: height,
              length: length,
              dimension_unit: dimension_unit,
            },
          },
          weight: {
            per_pcs: weight_per_pcs,
            weight_value: weight,
            weight_unit: weight_unit,
          },
          quantity: {
            unit_type: order_unit,
            moq: moq,
            moq_unit: moq_unit,
          },
          price: {
            last_price: last_price,
            currency: currency,
            price_unit: price_unit,
            full_part: full_part,
            half_part: half_part,
          },
          sample_submission: {
            date: sample_date,
            buyer_comment: comments,
          },
        });

        const productData = await Product.findById(product._id).populate(
          "process"
        );
        res.status(200).json({
          success: true,
          message: "SUCCESSFULLY PRODUCT REGISTERED",
          product: productData,
        });
      } else if (!isNaN(parseInt(p_id)) && isFinite(Number(p_id)) === false) {
        next(ErrorHandler("PLEASE ENTER VALID NUMBER or New", 404, res, next));
      } else if (!isNaN(parseInt(p_id)) && isFinite(Number(p_id)) === true) {
        let productId = productIdProvider(parseInt(p_id));

        const product = await Product.findOne({ p_id: productId }).populate(
          "process"
        );
        if (!product) {
          next(ErrorHandler("PRODUCT NOT FOUND", 500, res, next));
        }
        res.status(200).json({
          success: true,
          message: "",
          product,
        });
      } else {
        next(
          ErrorHandler("PLEASER ENTER VALID ID NUMBER OR New", 500, res, next)
        );
      }
    }
  }
);

exports.createProductProcess = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      product,
      category,
      process,
      spec,
      serial,
      value,
    }: {
      product: string;
      category: string;
      process: string;
      spec: string;
      serial: string;
      value: string;
    } = req.body;

    if (product === "") {
      return next(ErrorHandler("REFRESH", 200, res, next));
    }
    if (process === "") {
      return next(ErrorHandler("PROCESS NOT FOUND", 200, res, next));
    }
    if (spec === "") {
      return next(ErrorHandler("SPECIFICATION NOT FOUND", 200, res, next));
    }
    if (value === "") {
      return next(ErrorHandler("PROCESS VALUE NOT FOUND", 200, res, next));
    }
    const findProduct = await Product.findOne({ p_id: product }).populate(
      "process"
    );
    if (!findProduct) {
      return next(ErrorHandler("PRODUCT NOT FOUND", 200, res, next));
    }
    const processFind = findProduct?.process.find(
      (val: any) => val.name === process
    );
    if (processFind) {
      const process = await Process.findById(processFind?._id);
      const data = {
        name: spec,
        item: serial,
        value: value,
      };
      if (!process) {
        return next(
          ErrorHandler(
            "PROCESS NOT FOUND CALL THE ADMINISTRATION",
            200,
            res,
            next
          )
        );
      }
      await process.spec.push(data);
      await process.save();
      const freshProduct = await Product.findById(findProduct._id).populate(
        "process"
      );
      res.status(200).json({
        success: true,
        message: "PROCESS UPDATED",
        product: freshProduct,
      });
    } else {
      const data = {
        name: spec,
        item: serial,
        value: value,
      };
      const newProcess = await Process.create({
        name: process,
      });
      await newProcess.spec.push(data);
      await newProcess.save();
      await findProduct.process.push(newProcess?._id);
      await findProduct.save();
      const freshProduct = await Product.findById(findProduct._id).populate(
        "process"
      );
      res.status(200).json({
        success: true,
        message: "PROCESS UPDATED",
        product: freshProduct,
      });
    }
  }
);

exports.processSequenceChange = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { product, element, props, ind } = req.body;

    const findProduct = await Product.findOne({ p_id: product }).populate(
      "process"
    );

    if (props === "UP" && ind !== 0) {
      await Product.findByIdAndUpdate(findProduct?._id, {
        $pull: { process: element },
      });

      await Product.findByIdAndUpdate(findProduct?._id, {
        $push: {
          process: {
            $each: [element],
            $position: ind - 1,
          },
        },
      });

      const freshProduct = await Product.findById(findProduct?._id).populate(
        "process"
      );
      res.status(200).json({
        success: true,
        message: "SUCCESS",
        product: freshProduct,
      });
    }

    if (
      props === "DOWN" &&
      ind !== (findProduct?.process && findProduct?.process.length - 1)
    ) {
      await Product.findByIdAndUpdate(findProduct?._id, {
        $pull: { process: element },
      });

      await Product.findByIdAndUpdate(findProduct?._id, {
        $push: {
          process: {
            $each: [element],
            $position: ind + 2,
          },
        },
      });

      const freshProduct = await Product.findById(findProduct?._id).populate(
        "process"
      );
      res.status(200).json({
        success: true,
        message: "SUCCESS",
        product: freshProduct,
      });
    }

    if (props === "DELETE") {
      try {
        const process = await Process.findById(element);
        if (!process) {
          return next(ErrorHandler("PROCESS NOT FOUND", 404, res, next));
        }

        await Process.findByIdAndDelete(process._id);

        await Product.findByIdAndUpdate(
          findProduct?._id,
          { $pull: { processes: process._id } },
          { new: true }
        );

        const freshProduct = await Product.findById(findProduct?._id).populate(
          "process"
        );

        res.status(200).json({
          success: true,
          message: "Process deleted successfully",
          product: freshProduct,
        });
      } catch (error) {
        return next(ErrorHandler("Error deleting process", 500, res, next));
      }
    }
  }
);
