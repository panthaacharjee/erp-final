import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorhandler";
const catchAsyncError = require("../middleware/catchAsyncError");

const cloudinary = require("cloudinary");
import { Order } from "../models/Order/OrderModel";
import OrderCounter from "../models/Order/OrderSerial";
import { Product } from "../models/Product/ProductModel";

import generatePDFFromUrl from "../utils/generatePdf";
import path from "path";
import { Types } from "mongoose";
const fs = require("fs");
const handlebars = require("handlebars");

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
      user,
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

        if (order.user[order.user.length - 1].toString() !== user) {
          await order.user.push(new Types.ObjectId(user));
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

          if (
            order.user[order.user.length - 1].toString() !== user.toString()
          ) {
            await order.user.push(new Types.ObjectId(user));
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
        if (order?.user[order.user.length - 1].toString() !== user) {
          await order?.user.push(new Types.ObjectId(user));
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
        if (order?.user[order.user.length - 1].toString() !== user) {
          await order?.user.push(new Types.ObjectId(user));
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
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files were uploaded.",
        });
      }

      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required.",
        });
      }

      const order = await Order.findOne({ orderId: orderId });
      if (!order) {
        return next(ErrorHandler("Order not found", 404, res, next));
      }

      let file: any;

      if (Array.isArray(req.files)) {
        file = req.files[0];
      } else {
        file = req.files.file;
      }

      if (!file || (Array.isArray(file) && file.length === 0)) {
        return res.status(400).json({
          success: false,
          message: "No file was uploaded.",
        });
      }

      if (Array.isArray(file)) {
        file = file[0];
      }

      // Validate file type
      const allowedTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
      ];

      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid file type. Only Excel (.xls, .xlsx), PDF, and image files are allowed.",
        });
      }

      if (!file.data) {
        return res.status(400).json({
          error: "File data is undefined",
          fileStructure: Object.keys(file),
        });
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: "File size too large. Maximum size is 5MB.",
        });
      }

      const fileBase64 = file.data.toString("base64");

      const uploadOptions: any = {
        folder: "avatars",
        resource_type: "raw",
        public_id: `booking_${orderId}_${Date.now()}`,
        use_filename: true,
        unique_filename: false,
      };

      const uploadResult = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${fileBase64}`,
        uploadOptions
      );

      const bookingData = {
        "booking.public_id": uploadResult.public_id,
        "booking.url": uploadResult.secure_url,
        "booking.upload_date": Date.now(),
      };
      await Order.findByIdAndUpdate(order?._id, bookingData);

      const updateOrder = await Order.findById(order?._id).populate({
        path: "orderDetails.product",
        model: "product",
      });
      res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        order: updateOrder,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      return res.status(500).json({
        success: false,
        message: "File upload failed",
        error: error.message,
      });
    }
  }
);

exports.attachArtwork = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files were uploaded.",
        });
      }

      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required.",
        });
      }

      const order = await Order.findOne({ orderId: orderId });
      if (!order) {
        return next(ErrorHandler("Order not found", 404, res, next));
      }

      let file: any;

      if (Array.isArray(req.files)) {
        file = req.files[0];
      } else {
        file = req.files.file;
      }

      if (!file || (Array.isArray(file) && file.length === 0)) {
        return res.status(400).json({
          success: false,
          message: "No file was uploaded.",
        });
      }

      if (Array.isArray(file)) {
        file = file[0];
      }

      // Validate file type
      const allowedTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
      ];

      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid file type. Only Excel (.xls, .xlsx), PDF, and image files are allowed.",
        });
      }

      if (!file.data) {
        return res.status(400).json({
          error: "File data is undefined",
          fileStructure: Object.keys(file),
        });
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: "File size too large. Maximum size is 5MB.",
        });
      }

      const fileBase64 = file.data.toString("base64");

      const uploadOptions: any = {
        folder: "avatars",
        resource_type: "raw",
        public_id: `artwork_${orderId}_${Date.now()}`,
        use_filename: true,
        unique_filename: false,
      };

      const uploadResult = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${fileBase64}`,
        uploadOptions
      );

      const artworkData = {
        "artwork.public_id": uploadResult.public_id,
        "artwork.url": uploadResult.secure_url,
        "artwork.upload_date": Date.now(),
      };
      await Order.findByIdAndUpdate(order?._id, artworkData);

      const updateOrder = await Order.findById(order?._id).populate({
        path: "orderDetails.product",
        model: "product",
      });
      res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        order: updateOrder,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      return res.status(500).json({
        success: false,
        message: "File upload failed",
        error: error.message,
      });
    }
  }
);

exports.orderValidation = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id, user, mode, batchJob } = req.body;

    const order = await Order.findOne({ orderId: id });

    if (!order) {
      return next(ErrorHandler("CALL THE ADMINISTRATION", 400, res, next));
    }

    if (mode === "Entry Mode") {
      await Order.findByIdAndUpdate(order._id, {
        status: {
          mode: "Validated",
          batchJob: batchJob,
        },
      });
      await order.status.user.push(user);

      const freshOrder = await Order.findById(order._id).populate({
        path: "orderDetails.product",
        model: "product",
      });

      res.status(200).json({
        success: true,
        message: "",
        order: freshOrder,
      });
    } else if (mode === "Validated") {
      await Order.findByIdAndUpdate(order._id, {
        status: {
          mode: "Entry Mode",
        },
      });
      await order.status.user.push(user);

      const freshOrder = await Order.findById(order._id).populate({
        path: "orderDetails.product",
        model: "product",
      });

      res.status(200).json({
        success: true,
        message: "",
        order: freshOrder,
      });
    } else {
      return next(ErrorHandler("CALL THE ADMINISTRATION", 400, res, next));
    }
  }
);

exports.orderDetailsDelete = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId, serialsToDelete } = req.body;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return next(ErrorHandler("CALL THE ADMINISTRATION", 400, res, next));
    }

    if (
      !serialsToDelete ||
      !Array.isArray(serialsToDelete) ||
      serialsToDelete.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "PLEASE SELECT ATLEAST ONE SERIAL",
      });
    }

    // Filter out the items to delete and re-sequence the remaining ones
    const sera = order.orderDetails
      .filter((item: any) => !serialsToDelete.includes(item.serial))
      .map((item: any, index: any) => ({
        ...(item.toObject ? item.toObject() : item),
        serial: (index + 1).toString(), // Re-sequence starting from 1
      }));

    const updateOrderDelete = {
      orderDetails: sera,
    };
    await Order.findByIdAndUpdate(order?._id, updateOrderDelete);

    const updateOrder = await Order.findById(order?._id).populate({
      path: "orderDetails.product",
      model: "product",
    });

    res.status(200).json({
      success: true,
      order: updateOrder,
      message: "SUCCESSFULLY DETAILS DELETED",
    });
  }
);

exports.orderJobBag = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId, user }: any = req.body;

    const order = await Order.findOne({ orderId })
      .populate({
        path: "orderDetails.product",
        model: "product",
        populate: {
          path: "process",
          model: "process",
        },
      })
      .lean(); // Convert to plain object

    if (!order) {
      return next(ErrorHandler("CALL THE ADMINISTRATION", 400, res, next));
    }

    const result = await Order.aggregate([
      { $match: { orderId: orderId } },
      { $unwind: "$orderDetails" },
      {
        $group: {
          _id: {
            product: "$orderDetails.product",
            style_cc_iman: "$orderDetails.style_cc_iman",
          },

          originalOrder: { $first: "$$ROOT" },
          orderDetails: { $push: "$orderDetails" },
        },
      },
      {
        $project: {
          orderId: "$originalOrder.orderId",
          orderDate: "$originalOrder.orderDate",
          user: "$originalOrder.user",
          status: "$originalOrder.status",
          booking: "$originalOrder.booking",
          artwork: "$originalOrder.artwork",
          contactDetails: "$originalOrder.contactDetails",
          orderDetails: "$orderDetails",
          createdAt: "$originalOrder.createdAt",
          updatedAt: "$originalOrder.updatedAt",

          style_cc_iman: "$_id.style_cc_iman",
          product: "$_id.product",
        },
      },
    ]);
    console.log(result);

    // Convert aggregation results to plain objects
    const plainResults = result.map((item) => JSON.parse(JSON.stringify(item)));

    const populatedResults = await Order.populate(plainResults, {
      path: "orderDetails.product",
      model: "product",
      populate: {
        path: "process",
        model: "process",
      },
    });

    // Enhanced data with conditional properties for template
    const enhancedData = populatedResults.map((item: any, index: number) => {
      // Convert to plain object to avoid prototype issues
      const plainItem = JSON.parse(JSON.stringify(item));

      const firstOrderDetail =
        plainItem.orderDetails && plainItem.orderDetails[0];

      const product = firstOrderDetail?.product;
      const processes = product?.process;

      // Process array for the template table - ensure plain objects
      const processArray = Array.isArray(processes)
        ? processes.map((process: any) => ({
            name: process.name || "",
            spec: Array.isArray(process.spec) ? [...process.spec] : [],
            hasSpec: Array.isArray(process.spec) && process.spec.length > 0,
          }))
        : [];

      const orderMonth = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const orderDate = new Date(plainItem?.orderDate);
      const finalOrder = `${orderDate.getDate()}-${
        orderMonth[orderDate.getMonth()]
      }-${orderDate.getFullYear()}`;

      const reqDate = new Date(plainItem.contactDetails?.req_date);
      const finalReq = `${reqDate.getDate()}-${
        orderMonth[reqDate.getMonth()]
      }-${reqDate.getFullYear()}`;

      const base_qty_full = plainItem.orderDetails.reduce(
        (sum: number, detail: any) =>
          sum + (Number(detail.base_qty_full_part) || 0),
        0
      );
      const base_qty_half = plainItem.orderDetails.reduce(
        (sum: number, detail: any) =>
          sum + (Number(detail.base_qty_half_part) || 0),
        0
      );
      return {
        item,
        // Page conditions
        hasPageBreak: index > 0,
        isFirstPage: index === 0,
        isLastPage: index === populatedResults.length - 1,
        pageNumber: index + 1,
        totalPages: populatedResults.length,

        // Conditional flags for template
        isUrgent: plainItem.status === "Validated",

        hasMultipleProcesses: Array.isArray(processes) && processes.length > 1,
        hasProcesses: processArray.length > 0,

        // Formatted data for template
        formattedOrderDate: plainItem.orderDate
          ? new Date(plainItem.orderDate).toLocaleDateString()
          : "N/A",

        ORDERID: item.orderId,
        ORDER_DATE: finalOrder,
        JOBID: item.orderId.replace("/^BTPL/", "JB"),
        JOB_NO: index + 1,
        BUYER: plainItem.contactDetails?.buyer || "",
        VENDOR: plainItem.contactDetails?.vendor || "",
        BUYER_REF: plainItem.contactDetails?.buyerRef || "",
        VENDOR_REF: plainItem.contactDetails?.vendorRef || "",
        CS: plainItem.contactDetails?.sales || "",
        SEASON: plainItem.contactDetails?.season || "",
        REQ_DATE: finalReq || "",

        PRODUCT_ID: firstOrderDetail?.product?.p_id || "",
        LINE: firstOrderDetail?.line || "",
        CATEGORY: firstOrderDetail?.category || "",
        DESC: firstOrderDetail?.desc || "",
        HEIGHT:
          firstOrderDetail?.product?.dimensionDetails?.measure?.height || "",
        LENGTH:
          firstOrderDetail?.product?.dimensionDetails?.measure?.length || "",
        WIDTH:
          firstOrderDetail?.product?.dimensionDetails?.measure?.width || "",
        UNIT:
          firstOrderDetail?.product?.dimensionDetails?.measure
            ?.dimension_unit || "",

        totalQuantity: Array.isArray(plainItem.orderDetails)
          ? plainItem.orderDetails.reduce(
              (sum: number, detail: any) =>
                sum + (Number(detail.order_qty) || 0),
              0
            )
          : 0,

        baseQuantity: base_qty_full + base_qty_half,

        processArray: processArray,
      };
    });

    const htmlPath = path.join(__dirname, "../html/order/orderJob.html");
    const htmlContent = fs.readFileSync(htmlPath, "utf-8");

    const template = handlebars.compile(htmlContent, {
      noEscape: true,
      // This prevents the prototype access warnings
      runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
      },
    });

    const html = template({
      orders: enhancedData,
      summary: {
        totalJob: enhancedData.length,
        urgentOrders: enhancedData.filter((order: any) => order.isUrgent)
          .length,
        generatedDate: new Date().toLocaleDateString(),
        JOBPRINT: user,
      },
      hasMultipleOrders: enhancedData.length > 1,
    });

    console.log(enhancedData);

    const pdfBuffer = await generatePDFFromUrl({
      html: html,
      outputPath: "report.pdf",
    }).catch(console.error);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=order-${orderId}-job-bag.pdf`,
    });
    res.send(pdfBuffer);

    // res.status(200).json({
    //   success: true,
    //   test: enhancedData,
    // });
  }
);
