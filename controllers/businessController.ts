import { NextFunction, Request, Response } from "express";
import {
  Vendor,
  Buyer,
  ContactPerson,
} from "../models/Bussiness/ContactDetails";
import ErrorHandler from "../utils/errorhandler";
import mongoose, { Types } from "mongoose";
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
import { Process as ProductProcess } from "../models/Product/ProductModel";

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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { name, vendor, buyer } = req.body;

      // Input validation
      if (!name?.trim()) {
        await session.abortTransaction();
        return next(ErrorHandler("NAME IS REQUIRED", 400, res, next));
      }

      if (!buyer?.trim()) {
        await session.abortTransaction();
        return next(ErrorHandler("BUYER IS REQUIRED", 400, res, next));
      }

      // Check if program already exists globally
      const existingProgram = await Program.findOne({
        name: name.trim(),
      }).session(session);
      if (existingProgram) {
        await session.abortTransaction();
        return next(ErrorHandler("PROGRAM ALREADY EXISTS", 409, res, next));
      }

      let buyerDoc;
      let vendorDoc;

      // Handle different buyer scenarios
      if (buyer.toUpperCase() === "N/A") {
        // For N/A buyer, we need explicit vendor
        if (!vendor?.trim()) {
          await session.abortTransaction();
          return next(
            ErrorHandler("VENDOR IS REQUIRED FOR N/A BUYER", 400, res, next)
          );
        }

        vendorDoc = await Vendor.findOne({ title: vendor.trim() }).session(
          session
        );
        if (!vendorDoc) {
          await session.abortTransaction();
          return next(ErrorHandler("VENDOR NOT FOUND", 404, res, next));
        }

        // Find or create N/A buyer
        buyerDoc = await Buyer.findOne({ title: "N/A" }).session(session);
        if (!buyerDoc) {
          buyerDoc = await Buyer.create([{ title: "N/A" }], { session });
          buyerDoc = buyerDoc[0];
        }
      } else {
        // For specific buyer
        buyerDoc = await Buyer.findOne({ title: buyer.trim() }).session(
          session
        );
        if (!buyerDoc) {
          await session.abortTransaction();
          return next(ErrorHandler("BUYER NOT FOUND", 404, res, next));
        }

        // Handle vendor logic
        if (vendor?.trim()) {
          // Specific vendor provided
          vendorDoc = await Vendor.findOne({ title: vendor.trim() }).session(
            session
          );
          if (!vendorDoc) {
            await session.abortTransaction();
            return next(ErrorHandler("VENDOR NOT FOUND", 404, res, next));
          }
        } else {
          // No vendor provided, use buyer's first vendor
          await buyerDoc.populate({
            path: "vendor",
            options: { limit: 1 },
          });

          if (!buyerDoc.vendor || buyerDoc.vendor.length === 0) {
            await session.abortTransaction();
            return next(
              ErrorHandler(
                "NO VENDOR ASSOCIATED WITH THIS BUYER",
                400,
                res,
                next
              )
            );
          }
          vendorDoc = buyerDoc.vendor[0];
        }
      }

      // Create program
      const program = await Program.create(
        [
          {
            name: name.trim(),
            buyer: buyerDoc._id,
            vendor: vendorDoc._id,
          },
        ],
        { session }
      );

      if (!program || program.length === 0) {
        await session.abortTransaction();
        return next(ErrorHandler("FAILED TO CREATE PROGRAM", 500, res, next));
      }

      // Update vendor with new program
      await Vendor.findByIdAndUpdate(
        vendorDoc._id,
        { $push: { program: program[0]._id } },
        { session }
      );

      // Commit transaction
      await session.commitTransaction();

      res.status(201).json({
        success: true,
        message: "PROGRAM CREATED SUCCESSFULLY",
        data: {
          programId: program[0]._id,
          programName: program[0].name,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      console.error("Program creation error:", error);
      return next(ErrorHandler("INTERNAL SERVER ERROR", 500, res, next));
    } finally {
      session.endSession();
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

/* =====================================================================================================*/
/* ========================== PROCESS DETAILS (put) (/process/details) ======================== */
/* ===================================================================================================== */
exports.processDetails = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { line, process, details, information } = req.body;

      if (!line || !process) {
        return res.status(400).json({
          success: false,
          message: "Line and process are required",
        });
      }

      const lineData = await Line.findOne({ name: line }).populate("process");

      if (!lineData) {
        return res.status(404).json({
          success: false,
          message: "Line not found",
        });
      }

      if (!lineData.process || !Array.isArray(lineData.process)) {
        return res.status(404).json({
          success: false,
          message: "No processes found for this line",
        });
      }

      const processData = lineData.process.find(
        (val: any) => val.title === process
      );

      if (!processData) {
        return res.status(404).json({
          success: false,
          message: "Process not found in this line",
        });
      }

      const processByLine = await ProductProcess.find({
        line: line,
        name: process,
      });

      const bulkOps = processByLine.map((item) => ({
        updateOne: {
          filter: { _id: item._id },
          update: {
            $set: {
              details: details,
              information: information,
            },
          },
        },
      }));

      if (bulkOps.length > 0) {
        await ProductProcess.bulkWrite(bulkOps);
      }

      const updatedProcess = await Process.findByIdAndUpdate(
        processData._id,
        {
          details: details,
          information: information,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedProcess) {
        return next(ErrorHandler("UPDATE PROCESS FAILED", 400, res, next));
      }

      res.status(200).json({
        success: true,
        message: "SUCCESSFULLY UPDATED",
      });
    } catch (error) {
      console.error("Update error:", error); // Detailed error logging
      next(error);
    }
  }
);
