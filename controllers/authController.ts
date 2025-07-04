import { Request, Response, NextFunction } from "express";

const catchAsyncError = require("../middleware/catchAsyncError")
import User from "../models/Employee/UserModel";
import ErrorHandler from "../utils/errorhandler";
import hashPassword from "../utils/HashPassword";
import Counter from "../models/Employee/EmployeeSerial";
const {comparePassword} = require("../utils/ComparePassword")
const sendToken = require('../utils/jwtToken')
const token = require("../utils/Token")



/* =====================================================================================================*/
/* ============================= REGISTER EMPLOYEE (POST) (/register/employee) ================================= */
/* ===================================================================================================== */

exports.registerEmployee = catchAsyncError(async (req:Request, res:Response, next:NextFunction) => {
    const { id, 
      name,  
      joinDate, 
      section, 
      category, 
      designation, 
      department, 
      vill, 
      thana,
      post,
      postCode, 
      district, 
      father, 
      mother,
      blood,
      nid, 
      dob,
      phone,
      qualification,
      nomineeName, 
      relation, 
      account, 
      bankName, 
      route,
      userName,
      password,
      basic,
      home,
      medical,
      conveyance,
      food,
      special
    }:{
        userName:string,
        password:string,
        id:string,
        name:string, 
        salary:number,
        joinDate:Date,
        section:string,
        category:string,
        designation:string,
        department:string,
        vill:string,
        thana:string,
        post:string,
        postCode:number,
        district:string,
        father : string,
        mother:string,
        blood:string,
        nid:string,
        dob:Date,
        phone:string,
        certificate:string,
        qualification:string,
        nomineeName:string,
        relation:string,
        account:string,
        bankName :string,
        route:number,
        basic:number,
        home:number,
        medical:number,
        conveyance:number,
        food:number,
        special:number
    } = req.body;


    if(id==='new'){
      if(name===""){
        return next(ErrorHandler("NAME IS REQUIRED", 404, res, next))
      }
    }
    const userIdProvider = (props:number)=>{
      if(props< 10){
          return `Employee-0000${props}`
      }else if(props < 100){
          return `Employee-000${props}`
      }else if(props< 1000){
          return `Employee-00${props}`
      }else if(props< 10000){
          return `Employee-0${props}`
      }else{
          return `Employee-${props}`
      }
    }
    const user = await User.findOne({employeeId:id})
    if(user){
        const updateUser = await User.findByIdAndUpdate(user._id,{
              name,
              joinDate,
              section,
              category,
              designation,
              department,
              address:{
                vill: vill,
                thana: thana,
                post: post,
                postCode: postCode, 
                district: district,
              },
              salary:{
                basic: basic,
                home: home,
                medical:medical,
                conveyance:conveyance,
                food:food,
                special:special
              },
              personalInformation:{
                father: father, 
                mother :mother,
                blood : blood,
                nid: nid, 
                dob : dob,
                phone : phone,
              },
              education:{
                 qualification: qualification,
              },
              nominee:{
                name: nomineeName, 
                relation: relation,
              }, 
              bank:{
                account: account, 
                name: bankName, 
                route: route
              },
        },{
          new: true,
          runValidators: true,
          useFindAndModify: false,
        })
        res.status(200).json({
              success:true,
              message:"SUCCESSFULLY EMPLOYEE UPDATE",
              user: updateUser
        })
    }else{
      if(id===''){
        return next(ErrorHandler("THIS FIELD IS REQUIRED", 500, res, next))
      }else if(id === 'new'){
        const counter = await Counter.findOneAndUpdate(
          {id:'aval'},
          { $inc: { seq: 1 } },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
          }
        )
            
            const userId = userIdProvider(counter.seq)
        
            const user = await User.create({
              employeeId: userId,
              name,
              joinDate,
              section,
              category,
              designation,
              department,
            })
            res.status(200).json({
              success:true,
              message:"SUCCESSFULLY EMPLOYEE REGISTERED",
              user
            })
      }else if(!isNaN(parseFloat(id)) && isFinite(Number(id)) === false){
        next(ErrorHandler("PLEASE ENTER VALID NUMBER", 404, res, next))
      }else if(!isNaN(parseFloat(id)) && isFinite(Number(id)) === true){
        let userId= userIdProvider(parseInt(id)) ;
            
        const user = await User.findOne({employeeId:userId})
        if(!user){
          next(ErrorHandler("USER NOT FOUND", 500, res, next))
        }
        res.status(200).json({
              success:true,
              user
            })
      }else{
        next(ErrorHandler("PLEASER ENTER VALID ID NUMBER OR new", 500, res, next))
      }
    }  

    //  if(!userName || !password){
    //   return next(ErrorHandler("USERNAME OR PASSWORD REQUERED", 400, res, next))
    //  }

    // const userByEmail = await User.findOne({ userName }).catch();
    // if (userByEmail) {
    //   return next(ErrorHandler("THIS USER ALREADY EXISTS", 400, res, next))
    // }

    // const hashingPassword = await hashPassword(password)
    
    

    res.status(200).json({
      success: true,
      message:"SUCCESSFULLY EMPLOYEE REGISTERED",
    })
  });


/* ===================================================================================================== */
/* ============================= LOGIN USER (POST) (/login/user) ================================= */
/* ===================================================================================================== */

exports.loginUser = catchAsyncError(async (req:Request, res:Response, next:NextFunction) => {
    const { userName, password }:{userName:string, password:string }= req.body;

     if(!userName || !password){
      return next(ErrorHandler("USERNAME OR PASSWORD REQUERED", 400, res, next))
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
/* ============================= LOGIN AUTHORIZATION(POST) (/login/auth) ================================= */
/* ===================================================================================================== */

exports.loginAuth = catchAsyncError(async (req:Request, res:Response, next:NextFunction) => {
    const { email, name, accountType }:{
        email:string, 
        name:string,
        accountType:string,
    }= req.body;

    //Generating Random UserName
    function getSixDigitRandom(): number {
      return Math.floor(100000 + Math.random() * 900000);
    }

    const random6Digit = getSixDigitRandom(); 
    const id = `Gu-${random6Digit}`

    const accountUser = await User.find({account:accountType})
    let finalUser = accountUser.filter((val)=>val.email === email)
    
    if(finalUser.length !== 0){
      const user = await User.findById(finalUser[0]._id)
      if(user){
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
      }else{
        return next(ErrorHandler("SOMETHING WENT WRONG! PROCCED AFTER SOMETIMES", 502, res, next))
      }
    }else{
        const user = await User.create({
            employeeId:id,
            email:email,
            authentication: {
                password:"123456789"
            },
            role:"Guest",
            name:name,
            salary:20000,
            userName: `Gu`,
            account:accountType
            
        })
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
    }       
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


/* ===================================================================================================== */
/* ============================= USER PROFILE (GET) (/user/profile) ================================= */
/* ===================================================================================================== */
exports.getUser = catchAsyncError(async(req:Request, res:Response, next:NextFunction)=>{
    const user = await User.findById((req as any).user._id)

    res.status(200).json({
      success:true,
      user
    })
})


//*Pantha@acharjee#