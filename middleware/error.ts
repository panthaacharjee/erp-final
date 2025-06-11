import {  NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorhandler";

module.exports = (err:Error, req:Request, res:Response, next:NextFunction) => {
  err.message = err.message || "Internal Server Error";

  //Wrong Mongodb Id Error
  if (err.name === "CastError") {
    const message = `Resource Not Found. Invalid `;
    return ErrorHandler(message, 400, res, next);
  }


  //Wrong JWT  Error
  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is invalid, try again`;
    return ErrorHandler(message, 400, res, next);
  }

  //JWT Expire Error
  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token is Expired, try again`;
    return ErrorHandler(message, 400, res, next);
  }

  res.json({
    success: false,
    message: err.message,
  });
};
