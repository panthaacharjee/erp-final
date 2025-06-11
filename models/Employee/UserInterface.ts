import { Document } from "mongoose"
import ILoginHistory from "./LoginHistoryInterface"

interface IUser extends Document {
    employeeId:string,
    name: string,
    userName:string,
    authentication:{
        password: string,
        sessionToken:string
    }
    image?:{
        public_id :string,
        url :string
    }
    role: string,
    salary:number,
    joinDate:Date
    createdAt:Date,
    loginHistory: ILoginHistory[],
    section:string,
    category:string,
    designation:string,
    department:string,
    address:{
        vill:string,
        thana:string,
        post:string,
        postCode:number,
        district:string
    },
    personalInformation:{
        father : string,
        mother:string,
        blood:string,
        nid:string,
        dob:Date,
        phone:string
    },
    education:{
        certificate:string,
        qualification:string,
    },
    nominee:{
        name:string,
        relation:string
    },
    bank:{
        account:string,
        name :string,
        route:number
    }
}
export default IUser