import {Schema, model} from "mongoose"
import IUser from "./UserInterface"
import ILoginHistory from "./LoginHistoryInterface";


const LoginHistorySchema = new Schema<ILoginHistory>({
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String, required: true },
  userAgent: { type: String }
});

const userSchema = new Schema<IUser>({
    employeeId: {
        type:String,
        required:true
    },
    name: {
        type: String,
        required:true
    },
    userName:{
        type: String,
        required:true
    },
    authentication:{
        password:{
            type: String,
            required: true,
            select: false
        },
        sessionToken:{
            type: String,
            select: false
        }
    },
    image:{
        public_id: String,
        url: String
    },
    role:{
        type: String,
        required:true
    },
    salary:{
        type:Number,
        required:true
    },
    loginHistory:[LoginHistorySchema],
    joinDate:{
        type:Date,
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    section:{
        type: String
    },
    category:{
        type:String,
    },
    designation:{
        type:String,
    },
    department:{
        type:String,
    },
    
    address:{
        vill: String,
        thana: String,
        post: String,
        postCode: Number,
        district: String,
    },
    personalInformation:{
        father: String,
        mother: String,
        blood: String,
        dob: Date,
        phone: String,
    },
    education:{
        certificate: String,
        qualification: String,
    },
    nominee:{
        name: String,
        relation: String,
    },
    bank:{
        account:{
            type:String
        },
        name:{
            type:String,
        },
        route:{
            type:Number
        }
    }

},{
    timestamps:true
})



const user = model<IUser>('User', userSchema)
export default  user