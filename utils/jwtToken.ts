import { Response } from "express";
import IUser from "../models/Employee/UserInterface.js";

//Create token and saving in cookie
const sendToken = (user:IUser, statusCode:number, res:Response) => {
  try {
    const token = user.authentication.sessionToken
    const roleToken = token 
 
    res.status(statusCode).cookie('token', roleToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Critical!
      domain: 'localhost', // Omit in production
      path: '/',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    }).json({
      success:true,
      user
    });
  } catch (error) {
    console.log(error);
  }
};
module.exports = sendToken;
