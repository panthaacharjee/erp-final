import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorhandler";
const catchAsyncError = require("../middleware/catchAsyncError");

const cloudinary = require("cloudinary");
import { Order } from "../models/Order/OrderModel";
import OrderCounter from "../models/Order/OrderSerial";
import { Product } from "../models/Product/ProductModel";

exports.orderCreate = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      orderId,
      orderDate,
      buyer,
      buyerRef,
      vendor,
      vendorRef,
      contact,
      sales,
      req_date,
      season,
      product,
      serial,
      line,
      category,
      desc,
      model,
      item_pact_art,
      style_cc_iman,
      variable,
      gmts_color,
      size_age,
      ean_number,
      order_qty,
      order_unit,
      page_part,
      base_qty_full_part,
      base_qty_half_part,
      isDetails,
    }: {
      orderId: string;
      orderDate: Date;
      user: string;
      buyer: string;
      buyerRef: string;
      vendor: string;
      vendorRef: string;
      contact: string;
      sales: string;
      req_date: Date;
      season: string;
      product: string;
      serial: number;
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
      isDetails: boolean;
    } = req.body;

    const orderIdProvider = (props: number) => {
      if (props < 10) {
        return `BTPL/${new Date(Date.now()).getFullYear()}/0000${props}`;
      } else if (props < 100) {
        return `BTPL/${new Date(Date.now()).getFullYear()}/000${props}`;
      } else if (props < 1000) {
        return `BTPL/${new Date(Date.now()).getFullYear()}/00${props}`;
      } else if (props < 10000) {
        return `BTPL/${new Date(Date.now()).getFullYear()}/0${props}`;
      } else {
        return `BTPL/${new Date(Date.now()).getFullYear()}/${props}`;
      }
    };

    if (orderId === "") {
      return next(ErrorHandler("ORDER ID IS REQUIRED", 500, res, next));
    }

    if (isDetails === false) {
      const order = await Order.findOne({ orderId });
      if (order) {
        await Order.findByIdAndUpdate(
          order._id,
          {
            orderDate: orderDate,
            contactDetails: {
              buyer: buyer,
              vendor: vendor,
              buyerRef: buyerRef,
              vendorRef: vendorRef,
              contact: contact,
              sales: sales,
              req_date: req_date,
              season: season,
            },
          },
          {
            new: true,
            runValidators: true,
            useFindAndModify: false,
          }
        ).lean();

        if (order.user[order.user.length - 1] !== req.user) {
          await order.user.push(req.user);
          await order.save();
        }
        const updatedOrder = await Order.findById(order._id).populate({
          path: "orderDetails.product",
          model: "product",
        });
        res.status(200).json({
          success: true,
          message: "SUCCESSFULLY ORDER REGISTERED",
          order: updatedOrder,
        });
      } else {
        if (orderId === "New") {
          const counter = await OrderCounter.findOneAndUpdate(
            { id: "aval" },
            { $inc: { seq: 1 } },
            {
              new: true,
              upsert: true,
              setDefaultsOnInsert: true,
            }
          );

          const orderId = orderIdProvider(counter.seq);

          const order = await Order.create({
            orderId: orderId,
            orderDate: orderDate,
            contactDetails: {
              buyer: buyer,
              vendor: vendor,
              buyerRef: buyerRef,
              vendorRef: vendorRef,
              contact: contact,
              sales: sales,
              req_date: req_date,
              season: season,
            },
          });

          if (order.user[order.user.length - 1] !== req.user) {
            await order.user.push(req.user);
            await order.save();
          }
          const orderData = await Order.findById(order._id).populate({
            path: "orderDetails.product",
            model: "product",
          });
          res.status(200).json({
            success: true,
            message: "SUCCESSFULLY ORDER REGISTERED",
            order: orderData,
          });
        } else if (
          !isNaN(parseInt(orderId)) &&
          isFinite(Number(orderId)) === false
        ) {
          next(
            ErrorHandler("PLEASE ENTER VALID NUMBER or New", 404, res, next)
          );
        } else if (
          !isNaN(parseInt(orderId)) &&
          isFinite(Number(orderId)) === true
        ) {
          let orderPID = orderIdProvider(parseInt(orderId));

          const order = await Order.findOne({ orderId: orderPID }).populate({
            path: "orderDetails.product",
            model: "product",
          });
          if (!order) {
            next(ErrorHandler("ORDER NOT FOUND", 500, res, next));
          }
          res.status(200).json({
            success: true,
            message: "",
            order,
          });
        } else {
          next(
            ErrorHandler("PLEASER ENTER VALID ID NUMBER OR New", 500, res, next)
          );
        }
      }
    } else if (isDetails === true) {
      const order = await Order.findOne({ orderId });
      if (!order) {
        next(ErrorHandler("ORDER NOT FOUND", 500, res, next));
      }
      const orderDetail = order?.orderDetails.find(
        (val: any) => val.serial === serial
      );

      if (serial < 1) {
        next(ErrorHandler("SERIAL START WITH 1", 500, res, next));
      }

      if (orderDetail) {
        await Order.findOneAndUpdate(
          {
            _id: order?._id,
            "orderDetails.serial": serial,
          },
          {
            $set: {
              "orderDetails.$.product": product,
              "orderDetails.$.line": line,
              "orderDetails.$.category": category,
              "orderDetails.$.desc": desc,
              "orderDetails.$.model": model,
              "orderDetails.$.item_pact_art": item_pact_art,
              "orderDetails.$.style_cc_iman": style_cc_iman,
              "orderDetails.$.variable": variable,
              "orderDetails.$.gmts_color": gmts_color,
              "orderDetails.$.size_age": size_age,
              "orderDetails.$.order_qty": order_qty,
              "orderDetails.$.order_unit": order_unit,
              "orderDetails.$.page_part": page_part,
              "orderDetails.$.base_qty_full_part": base_qty_full_part,
              "orderDetails.$.base_qty_half_part": base_qty_half_part,
              "orderDetails.$.ean_number": ean_number,
            },
          },
          { new: true }
        );
        if (order?.user[order.user.length - 1] !== req.user) {
          await order?.user.push(req.user);
          await order?.save();
        }
        const updateOrder = await Order.findById(order?._id).populate({
          path: "orderDetails.product",
          model: "product",
        });
        res.status(200).json({
          success: true,
          message: "",
          order: updateOrder,
        });
      } else if (order && order?.orderDetails.length === serial - 1) {
        const orderDetailsData = {
          serial: serial,
          product: product,
          line: line,
          category: category,
          desc: desc,
          model: model,
          item_pact_art: item_pact_art,
          style_cc_iman: style_cc_iman,
          variable: variable,
          gmts_color: gmts_color,
          size_age: size_age,
          ean_number: ean_number,
          order_qty: order_qty,
          order_unit: order_unit,
          page_part: page_part,
          base_qty_full_part,
          base_qty_half_part,
        };
        await order?.orderDetails.push(orderDetailsData as any);
        await order.save();
        if (order?.user[order.user.length - 1] !== req.user) {
          await order?.user.push(req.user);
          await order?.save();
        }

        const updateOrder = await Order.findById(order._id).populate({
          path: "orderDetails.product",
          model: "product",
        });
        res.status(200).json({
          success: true,
          message: "SUCCESSFULLY ORDER UPDATED",
          order: updateOrder,
        });
      } else {
        next(
          ErrorHandler(
            `SKIPPED ${
              order?.orderDetails && order?.orderDetails?.length + 1
            } SERIAL`,
            500,
            res,
            next
          )
        );
      }
    } else {
      console.log("ERROR FROM ORDER CONTROLLER");
    }
  }
);

exports.orderProduct = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { buyer, vendor, line, category } = req.body;

    // Validate that all required fields are provided and not empty
    if (!buyer || buyer.trim() === "") {
      return next(ErrorHandler("Buyer is required", 400, res, next));
    }
    if (!vendor || vendor.trim() === "") {
      return next(ErrorHandler("Vendor is required", 400, res, next));
    }
    if (!line || line.trim() === "") {
      return next(ErrorHandler("Product line is required", 400, res, next));
    }
    if (!category || category.trim() === "") {
      return next(ErrorHandler("Category is required", 400, res, next));
    }

    // Build filter with all required elements
    const filter: any = {
      "contactDetails.buyer": buyer,
      "contactDetails.vendor": vendor,
      "product.line": line,
      "product.category": category,
    };

    const products = await Product.find(filter)
      .where("status.mode")
      .equals("Validated");

    res.status(200).json({
      success: true,
      products: products,
    });
  }
);

exports.attachBooking = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId, file }: any = req.body;

    const order = await Order.findOne({ orderId: orderId }).select(
      "_id,orderDate"
    );
    if (!order) {
      next(ErrorHandler("ORDER NOT FOUND", 404, res, next));
    }

    if (!file || Object.keys(file).length === 0) {
      return res.status(400).json({ error: "No files were uploaded." });
    }

    console.log(file, order);

    // Validate file type
    const allowedTypes = {
      "application/vnd.ms-excel": "excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "excel",
      "application/pdf": "pdf",
      "image/png": "png",
    };

    const mimetype = file.mimetype as keyof typeof allowedTypes;

    if (!allowedTypes[mimetype]) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid file type. Only Excel (.xls, .xlsx), PDF, and PNG files are allowed.",
      });
    }
    console.log(mimetype);

    // const fileType = allowedTypes[mimetype];

    // // Upload to Cloudinary
    // const uploadOptions = {
    //   folder: "uploads",
    //   resource_type: fileType === "pdf" ? "raw" : "image",
    // };

    // const result = await cloudinary.uploader.upload(
    //   uploadedFile.tempFilePath,
    //   uploadOptions
    // );

    // console.log(result);
  }
);
