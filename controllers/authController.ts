import { Request, Response, NextFunction } from "express";

const catchAsyncError = require("../middleware/catchAsyncError")
import User from "../models/Employee/UserModel";
import ErrorHandler from "../utils/errorhandler";
import hashPassword from "../utils/HashPassword";
// const {comparePassword} = require("../utils/ComparePassword")
// const sendToken = require('../utils/jwtToken')
// const token = require("../utils/Token")



/* =====================================================================================================*/
/* ============================= REGISTER EMPLOYEE (POST) (/register/employee) ================================= */
/* ===================================================================================================== */

exports.registerEmployee = catchAsyncError(async (req:Request, res:Response, next:NextFunction) => {
    const { id, name, userName, password, salary, role}:{
        id:string,
        name:string, 
        userName:string, 
        password:string, 
        salary:number, 
        role: String
    } = req.body;



     if(!userName || !password){
      return next(ErrorHandler("USERNAME OR PASSWORD REQUERED", 400, res, next))
     }

    const userByEmail = await User.findOne({ userName }).catch();
    if (userByEmail) {
      return next(ErrorHandler("THIS USER ALREADY EXISTS", 400, res, next))
    }

    const hashingPassword = await hashPassword(password)
    
    await User.create({
      employeeId:id,
      name,
      userName,
      authentication:{
        password:hashingPassword
      },
      salary,
      role
    });


    res.status(200).json({
      success: false,
      message:"SUCCESSFULLY EMPLOYEE REGISTERED"
    })
  });


exports.getUsers = async(req:Request, res:Response)=>{
    const users = await User.find()
    res.status(200).json({
        success:true,
        users
    })
}