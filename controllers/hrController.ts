import { Request, Response, NextFunction } from "express";

const catchAsyncError = require("../middleware/catchAsyncError")
import User from "../models/Employee/UserModel";
import ErrorHandler from "../utils/errorhandler";
import Counter from "../models/Employee/EmployeeSerial";
const {comparePassword} = require("../utils/ComparePassword")
const sendToken = require('../utils/jwtToken')
const token = require("../utils/Token")



/* =====================================================================================================*/
/* ============================= ALL EMPLOYEE (get) (/all/user) ================================= */
/* ===================================================================================================== */

exports.allEmployee = catchAsyncError(async (req:Request, res:Response, next:NextFunction) => {
    const users = await User.find()

    res.status(200).json({
      success: true,
      users
    })
  });