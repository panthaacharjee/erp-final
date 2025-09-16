import { NextFunction, Request, Response } from "express";
import {
  Vendor,
  Buyer,
  ContactPerson,
} from "../models/Bussiness/ContactDetails";
import ErrorHandler from "../utils/errorhandler";
import { Types } from "mongoose";
const catchAsyncError = require("../middleware/catchAsyncError");
import {
  lineModel as Line,
  categoryModel as Category,
  programModel as Program,
  processModel as Process,
  specModel as Specification,
  serialModel as Serial,
  itemModel as Item,
} from "../models/Bussiness/ProductLine";
import { populate } from "dotenv";

/* =====================================================================================================*/
/* ================= Create Buyer (POST) (/buyer/create) ============================= */
/* ===================================================================================================== */
exports.buyerCreate = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      name,
      code,
      address,
    }: { name: string; code: string; address: string } = req.body;
    if (name === undefined || code === undefined) {
      return next(ErrorHandler("THIS FIELD IS REQUIRED", 404, res, next));
    }

    const existBuyer = await Buyer.findOne({ title: name });

    if (existBuyer) {
      return next(ErrorHandler("BUYER IS ALREADY EXIST", 404, res, next));
    }
    await Buyer.create({
      title: name,
      code: code,
      address: address,
    });

    res.status(200).json({
      success: true,
      message: "BUYER REGISTERED SUCCESSFULLY",
    });
  }
);

/* =====================================================================================================*/
/* ================= Create Vendor (POST) (/vendor/create) ============================= */
/* ===================================================================================================== */
exports.vendorCreate = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, code, buyer }: { name: string; code: string; buyer: string } =
      req.body;
    if (name === undefined || code === undefined) {
      return next(ErrorHandler("THIS FIELD IS REQUIRED", 404, res, next));
    }

    if (buyer === "") {
      return next(ErrorHandler("BUYER IS REQUIRED", 404, res, next));
    }

    const buyerModel = await Buyer.findOne({ title: buyer }).populate("vendor");
    if (!buyerModel) {
      return next(ErrorHandler("BUYER IS NOT FOUND", 404, res, next));
    }

    const existVendorInBuyer = buyerModel?.vendor?.find(
      (item: any) => item.title === name
    );
    if (existVendorInBuyer) {
      return next(ErrorHandler("VENDOR IS ALREADY EXIST", 404, res, next));
    }

    try {
      const vendor = await Vendor.create({
        title: name,
        code: code,
      });
      if (vendor) {
        buyerModel.vendor.push(vendor._id as Types.ObjectId);
        await buyerModel.save();
        res.status(200).json({
          success: true,
          message: "VENDOR REGISTERED SUCCESSFULLY",
        });
      }
    } catch (error: any) {
      if (error.code === 11000) {
        const vendor = await Vendor.findOne({ title: name });
        await buyerModel.vendor.push(vendor?._id as Types.ObjectId);
        await buyerModel.save();
        res.status(200).json({
          success: true,
          message: "VENDOR ACCESIATED SUCCESSFULLY",
        });
      }
    }
  }
);

/* =====================================================================================================*/
/* ================= Create Contact (POST) (/contact/create) ============================= */
/* ===================================================================================================== */
exports.contactCreate = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      name,
      mail,
      phone,
      vendor,
    }: { name: string; mail: string; phone: string; vendor: string } = req.body;
    if (name === "" || mail === "" || phone === "") {
      return next(ErrorHandler("THIS FIELD IS REQUIRED", 404, res, next));
    }

    if (!vendor) {
      return next(ErrorHandler("VENDOR IS REQUIRED", 404, res, next));
    }
    const vendorModel = await Vendor.findOne({ title: vendor });
    if (!vendorModel) {
      return next(ErrorHandler("VENDOR NOT FOUND", 404, res, next));
    }
    const contact = await ContactPerson.create({
      name,
      mail,
      number: phone,
    });

    if (contact) {
      await vendorModel.contact.push(contact._id as Types.ObjectId);
      await vendorModel.save();
      res.status(200).json({
        success: true,
        message: "CONTACT PERSON REGISTERED SUCCESSFULLY",
      });
    }
  }
);

/* =====================================================================================================*/
/* ================================ GET ORGANIZATION (GET) (/get/organization) ============================= */
/* ===================================================================================================== */
exports.getOrganization = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const organization = await Buyer.find()
      .populate({
        path: "vendor",
        populate: {
          path: "contact",
        },
      })
      .populate({
        path: "vendor",
        populate: {
          path: "program",
        },
      });

    res.status(200).json({
      success: true,
      organization,
    });
  }
);

/* =====================================================================================================*/
/* ========================== Create Product Line (post) (/create/product/line) ======================== */
/* ===================================================================================================== */
exports.createLine = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      name,
      code,
      others,
    }: { name: string; code: string; others: string } = req.body;
    if (name === undefined || code === undefined) {
      return next(ErrorHandler("NAME & CODE IS REQUIRED", 401, res, next));
    }

    const existName = await Line.findOne({ name });
    if (existName) {
      return next(
        ErrorHandler("THIS PRODUCT LINE ALREADY EXIST", 401, res, next)
      );
    }

    await Line.create({
      name,
      code,
      others,
    });

    res.status(201).json({
      success: true,
      message: "SUCCESSFULLY PRODUCT LINE CREATED",
    });
  }
);

/* ==================================================================================================== */
/* ===================== Create Product Category (post) (/create/product/category) ==================== */
/* ==================================================================================================== */
exports.createCategory = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { category, code, line } = req.body;

    const lineModel = await Line.findOne({ name: line });

    if (!lineModel) {
      return next(ErrorHandler("PRODUCT LINE NOT FOUND", 404, res, next));
    }

    const existCategory = await Category.findOne({ category });

    if (existCategory) {
      return next(ErrorHandler("THIS CATEGORY ALREADY EXIST", 401, res, next));
    }

    const newCategory = await Category.create({
      category,
      code,
    });

    if (newCategory) {
      await lineModel.category.push(newCategory._id as Types.ObjectId);
      await lineModel.save();
    }

    res.status(201).json({
      success: true,
      message: "SUCCESSFULLY CATEGORY CREATED",
    });
  }
);

/* ==================================================================================================== */
/* =============================== Create Program (post) (/create/program) ============================ */
/* ==================================================================================================== */
exports.createProgram = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, vendor, buyer } = req.body;

    if (name === undefined) {
      return next(ErrorHandler("NAME  IS REQUIRED", 401, res, next));
    }

    if (buyer === "N/A") {
      const existVendor = await Vendor.findOne({ title: vendor });
      const existBuyer = await Buyer.findOne({ title: buyer });

      if (!existVendor) {
        return next(ErrorHandler("VENDOR IS REQUIRED", 401, res, next));
      }
      if (!existBuyer) {
        return next(ErrorHandler("BUYER IS REQUIRED", 401, res, next));
      }
      const program = await Program.create({
        name,
        buyer: existBuyer._id as Types.ObjectId,
        vendor: existVendor?._id as Types.ObjectId,
      });

      await existVendor?.program?.push(program._id as Types.ObjectId);
      await existVendor?.save();

      res.status(200).json({
        success: true,
        message: "SUCCESSFULLY PROGRAM CREATED",
      });
    } else {
      const existBuyer = await Buyer.findOne({ title: buyer }).populate({
        path: "vendor",
        populate: {
          path: "program",
        },
      });

      if (!existBuyer) {
        return next(ErrorHandler("BUYER IS REQUIRED", 401, res, next));
      }

      if (vendor) {
        const program = await Program.findOne({ name });
        const exitVendor = await Vendor.findOne({ title: vendor });
        await exitVendor?.program.push(program?._id as Types.ObjectId);
        await exitVendor?.save();
        res.status(200).json({
          success: true,
          message: "SUCCESSFULLY PROGRAM CREATED",
        });
      } else {
        let program;
        const existProgram = await Program.findOne({ name });
        if (existProgram) {
          program = existProgram;
        }
        program = await Program.create({
          name,
          buyer: existBuyer._id as Types.ObjectId,
          vendor: existBuyer.vendor[0]._id,
        });

        const bulkOps = existBuyer.vendor.map((item) => ({
          updateOne: {
            filter: { _id: item._id },
            update: {
              $push: {
                program: program._id,
              },
            },
          },
        }));

        await Vendor.bulkWrite(bulkOps);
        res.status(200).json({
          success: true,
          message: "SUCCESSFULLY PROGRAM CREATED",
        });
      }
    }
  }
);

/* =====================================================================================================*/
/* ========================== Create Process (post) (/create/product/Process) ======================== */
/* ===================================================================================================== */
exports.createProcess = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { title, line }: { title: string; line: string } = req.body;
    if (title === undefined) {
      return next(ErrorHandler("TITLE IS REQUIRED", 401, res, next));
    }

    const productLine = await Line.findOne({ name: line }).populate("process");

    if (!productLine) {
      return next(ErrorHandler("PRODUCT LINE NOT FOUND", 401, res, next));
    }

    const existProcess = productLine.process.find(
      (item: any) => item.title === title
    );
    if (existProcess) {
      return next(
        ErrorHandler(`PROCESS ALREADY EXIST IN ${line} LINE`, 401, res, next)
      );
    }

    const process = await Process.create({
      title: title,
    });

    await productLine?.process.push(process?._id as Types.ObjectId);
    await productLine?.save();

    res.status(200).json({
      success: true,
      message: "SUCCESSFULLY UPDATED",
    });
  }
);

/* =====================================================================================================*/
/* =================== Create Specification (post) (/create/process/specification) ===================== */
/* ===================================================================================================== */
exports.createSpecification = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      title,
      process,
      line,
    }: { title: string; process: string; line: string } = req.body;

    if (title === undefined) {
      return next(ErrorHandler("TITLE IS REQUIRED", 401, res, next));
    }

    const productLine = await Line.findOne({ name: line })
      .populate("process")
      .populate({
        path: "process",
        populate: {
          path: "spec",
        },
      });

    if (!productLine) {
      return next(ErrorHandler("PRODUCT LINE NOT FOUND", 401, res, next));
    }

    const existProcess = productLine.process.find(
      (item: any) => item.title === process
    );
    if (!existProcess) {
      return next(ErrorHandler(`PROCESS NOT FOUND`, 401, res, next));
    }

    const processDb = await Process.findById(existProcess._id).populate("spec");
    if (!processDb) {
      return next(ErrorHandler(`PROCESS NOT FOUND`, 401, res, next));
    }

    const existSpecification = processDb.spec.find(
      (item: any) => item.title === title
    );
    if (existSpecification) {
      return next(
        ErrorHandler(
          `SPECIFICATION ALREADY EXISTS IN ${line} DEPARTMENT OF ${processDb?.title} PROCESS`,
          401,
          res,
          next
        )
      );
    }
    const spec = await Specification.create({
      title: title,
    });

    await processDb.spec.push(spec?._id as Types.ObjectId);
    await processDb.save();

    res.status(200).json({
      success: true,
      message: "SUCCESSFULLY UPDATED",
    });
  }
);

/* =====================================================================================================*/
/* =================== Create Serial (post) (/create/process/serial) ===================== */
/* ===================================================================================================== */
exports.createSerial = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      title,
      process,
      line,
      spec,
    }: { title: string; process: string; spec: string; line: string } =
      req.body;

    if (title === undefined) {
      return next(ErrorHandler("TITLE IS REQUIRED", 401, res, next));
    }

    const productLine = await Line.findOne({ name: line })
      .populate("process")
      .populate({
        path: "process",
        populate: {
          path: "spec",
          populate: {
            path: "serial",
          },
        },
      });

    if (!productLine) {
      return next(ErrorHandler("PRODUCT LINE NOT FOUND", 401, res, next));
    }

    const existProcess = productLine.process.find(
      (item: any) => item.title === process
    );
    if (!existProcess) {
      return next(ErrorHandler(`PROCESS NOT FOUND`, 401, res, next));
    }

    const processDb = await Process.findById(existProcess._id).populate("spec");
    if (!processDb) {
      return next(ErrorHandler(`PROCESS NOT FOUND`, 401, res, next));
    }

    const existSpecification = processDb.spec.find(
      (item: any) => item.title === spec
    );
    if (!existSpecification) {
      return next(ErrorHandler(`SPECIFICATION NOT FOUND`, 401, res, next));
    }

    const specDb = await Specification.findById(
      existSpecification._id
    ).populate("serial");
    if (!specDb) {
      return next(ErrorHandler(`SPECIFICATION NOT FOUND`, 401, res, next));
    }

    const existSerial = specDb.serial.find((item: any) => item.title === title);
    if (existSerial) {
      return next(ErrorHandler(`SERIAL ALREADY EXIST`, 401, res, next));
    }

    const serial = await Serial.create({
      title: title,
    });

    await specDb.serial.push(serial?._id as Types.ObjectId);
    await specDb.save();

    res.status(200).json({
      success: true,
      message: "SUCCESSFULLY UPDATED",
    });
  }
);

/* =====================================================================================================*/
/* =================== Create Item (post) (/create/process/item) ===================== */
/* ===================================================================================================== */
exports.createItem = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      title,
      process,
      line,
      spec,
      serial,
    }: {
      title: string;
      process: string;
      spec: string;
      line: string;
      serial: string;
    } = req.body;

    if (title === undefined) {
      return next(ErrorHandler("TITLE IS REQUIRED", 401, res, next));
    }

    const productLine = await Line.findOne({ name: line })
      .populate("process")
      .populate({
        path: "process",
        populate: {
          path: "spec",
          populate: {
            path: "serial",
          },
        },
      });

    if (!productLine) {
      return next(ErrorHandler("PRODUCT LINE NOT FOUND", 401, res, next));
    }

    const existProcess = productLine.process.find(
      (item: any) => item.title === process
    );
    if (!existProcess) {
      return next(ErrorHandler(`PROCESS NOT FOUND`, 401, res, next));
    }

    const processDb = await Process.findById(existProcess._id).populate("spec");
    if (!processDb) {
      return next(ErrorHandler(`PROCESS NOT FOUND`, 401, res, next));
    }

    const existSpecification = processDb.spec.find(
      (item: any) => item.title === spec
    );
    if (!existSpecification) {
      return next(ErrorHandler(`SPECIFICATION NOT FOUND`, 401, res, next));
    }

    const specDb = await Specification.findById(
      existSpecification._id
    ).populate("serial");
    if (!specDb) {
      return next(ErrorHandler(`SPECIFICATION NOT FOUND`, 401, res, next));
    }

    const existSerial = specDb.serial.find(
      (item: any) => item.title === serial
    );
    if (!existSerial) {
      return next(ErrorHandler(`SERIAL NOT FOUND`, 401, res, next));
    }

    const serialDb = await Serial.findById(existSerial._id).populate("item");
    if (!serialDb) {
      return next(ErrorHandler(`SERIAL NOT FOUND`, 401, res, next));
    }

    const existItem = serialDb.item.find((item: any) => item.title === title);
    if (existItem) {
      return next(ErrorHandler(`ITEM ALREADY EXIST`, 401, res, next));
    }

    const item = await Item.create({
      title: title,
    });

    await serialDb.item.push(item?._id as Types.ObjectId);
    await serialDb.save();

    res.status(200).json({
      success: true,
      message: "SUCCESSFULLY UPDATED",
    });
  }
);

/* =====================================================================================================*/
/* ========================== Get Product Line (get) (/get/product/line) ======================== */
/* ===================================================================================================== */
exports.getLine = catchAsyncError(async (req: Request, res: Response) => {
  const productLine = await Line.find()
    .populate("category")
    .populate({
      path: "process",
      populate: {
        path: "spec",
        populate: {
          path: "serial",
          populate: {
            path: "item",
          },
        },
      },
    });

  res.status(200).json({
    success: true,
    line: productLine,
  });
});
