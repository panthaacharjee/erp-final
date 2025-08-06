import { NextFunction, Request, Response } from "express";
import { Vendor, Buyer, ContactPerson } from "../models/Bussiness/ContactDetails";
import ErrorHandler from "../utils/errorhandler";
import { Types } from "mongoose";
const catchAsyncError = require("../middleware/catchAsyncError")


/* =====================================================================================================*/
/* ================= Create Buyer (POST) (/buyer/create) ============================= */
/* ===================================================================================================== */
exports.buyerCreate = catchAsyncError(async(req:Request, res:Response, next:NextFunction)=>{
    const {name, code, address}:{name:string, code:string, address:string} = req.body
    if(name===undefined || code===undefined){
        return next(ErrorHandler("THIS FIELD IS REQUIRED", 404, res, next))
    }

    const existBuyer = await Buyer.findOne({title:name})

    if(existBuyer){
        return next(ErrorHandler("BUYER IS ALREADY EXIST", 404, res, next))
    }
    await Buyer.create({
        title:name,
        code:code, 
        address:address
    })

    res.status(200).json({
        success:true,
        message:"BUYER REGISTERED SUCCESSFULLY"
    })
})


/* =====================================================================================================*/
/* ================= Create Vendor (POST) (/vendor/create) ============================= */
/* ===================================================================================================== */
exports.vendorCreate = catchAsyncError(async(req:Request, res:Response, next:NextFunction)=>{
    const {name, code, buyer}:{name:string, code:string, buyer:string} = req.body
    if(name===undefined || code===undefined){
        return next(ErrorHandler("THIS FIELD IS REQUIRED", 404, res, next))
    }

    if(buyer===""){
        return next(ErrorHandler("BUYER IS REQUIRED", 404, res, next))
    }

    const buyerModel = await Buyer.findOne({title: buyer})
    if(!buyerModel){
        return next(ErrorHandler("BUYER IS NOT FOUND", 404, res, next))
    }

    const existVendor = await Vendor.findOne({title:name})
    if(existVendor){
        return next(ErrorHandler("VENDOR IS ALREADY EXIST", 404, res, next))
    }
    
    const vendor = await Vendor.create({
        title:name,
        code:code
    })
    if(vendor){
        await buyerModel.vendor.push(vendor._id as Types.ObjectId)
        await buyerModel.save()
        res.status(200).json({
            success:true,
            message:"VENDOR REGISTERED SUCCESSFULLY"
        })
    }

})

/* =====================================================================================================*/
/* ================= Create Contact (POST) (/contact/create) ============================= */
/* ===================================================================================================== */
exports.contactCreate = catchAsyncError(async(req:Request, res:Response, next:NextFunction)=>{
    const {name, mail, phone, vendor}:{name:string, mail:string, phone:string, vendor:string} = req.body
    if(name==="" || mail==="" || phone===""){
        return next(ErrorHandler("THIS FIELD IS REQUIRED", 404, res, next))
    }

    if(!vendor){
        return next(ErrorHandler("VENDOR IS REQUIRED", 404, res, next))
    }
    const vendorModel= await Vendor.findOne({title:vendor})
    if(!vendorModel){
        return next(ErrorHandler("VENDOR NOT FOUND", 404, res, next))
    }
    const contact = await ContactPerson.create({
        name,
        mail,
        number: phone
    })

    if(contact){
        await vendorModel.contact.push(contact._id as Types.ObjectId)
        await vendorModel.save()
        res.status(200).json({
            success:true,
            message:"CONTACT PERSON REGISTERED SUCCESSFULLY"
        })
    }
})


/* =====================================================================================================*/
/* ================================ GET ORGANIZATION (GET) (/get/organization) ============================= */
/* ===================================================================================================== */
exports.getOrganization = catchAsyncError(async(req:Request, res:Response, next:NextFunction)=>{
    const organization = await Buyer.find().populate({
        path:"vendor",
        populate:{
            path:"contact"
        }
    })

    res.status(200).json({
        success:true,
        organization
    })
})