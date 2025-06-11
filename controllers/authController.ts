import { Request, Response, NextFunction } from "express";

const catchAsyncError = require("../middleware/catchAsyncError")
import User from "../models/Employee/UserModel";
import ErrorHandler from "../utils/errorhandler";
import hashPassword from "../utils/HashPassword";
const {comparePassword} = require("../utils/ComparePassword")
const sendToken = require('../utils/jwtToken')
const token = require("../utils/Token")



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


/* ===================================================================================================== */
/* ============================= LOGIN USER (POST) (/login/user) ================================= */
/* ===================================================================================================== */

exports.loginUser = catchAsyncError(async (req:Request, res:Response, next:NextFunction) => {
    const { userName, password }:{userName:string, password:string }= req.body;

     if(!userName || !password){
      return next(ErrorHandler("EMAIL OR PASSWORD REQUERED", 400, res, next))
     }
   
     const user = await User.findOne({ userName }).select("+authentication.password")
     if(!user){
        return next(ErrorHandler("PLEASE ENTER VALID USERNAME OR PASSWORD", 400, res, next))
     }

     const isPasswordMatched = await comparePassword(password, user.authentication.password)
     if(!isPasswordMatched){
      return next(ErrorHandler("PLEASE ENTER VALID USERNAME OR PASSWORD", 400, res, next)) 
     }  
    
    await user.loginHistory.push({
      timestamp: new Date(),
      ipAddress: req.clientIp,
      // userAgent: req.headers['user-agent']
    });
    await user.save()
    
    const sessionToken = token(user._id)
    user.authentication.sessionToken = sessionToken
    await user.save()
    sendToken(user, 201, res);
});


/* ===================================================================================================== */
/* ============================= LOGOUT USER (GET) (/logout) ================================= */
/* ===================================================================================================== */

exports.logout = catchAsyncError(async (req:Request, res:Response, next:NextFunction) => {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
    res.status(200).json({
      success: true,
      message: "LOG OUT",
    });
  });


  
/* ===================================================================================================== */
/* ============================= LOGIN HISTROY USER (GET) (/user/login/history) ================================= */
/* ===================================================================================================== */

export const getLoginHistory = catchAsyncError(async (req: Request, res: Response) => {
  const user = await User.findById((req as any).user._id)
      .select('loginHistory')
      .lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const date = new Date(user.loginHistory[user.loginHistory.length-2].timestamp)
    const dateH = date.getHours()
    const dateM = date.getMinutes()
    const dateS = date.getSeconds()
    
    res.json({ loginHistory: `${dateH}/${dateM}/${dateS}`, login:user.loginHistory }, );
})
