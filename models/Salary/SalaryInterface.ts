import { Document, Types } from "mongoose";
import IUser from "../Employee/UserInterface";


export interface SalaryInterface extends Document{
    user: Types.ObjectId | IUser ,
    date:Date,
    salary:{
        main: number,
        basic:number,
        home:number,
        medical:number,
        food:number,
        conveyance:number,
        special:number,
    },
    attendence:{
        present:number,
        weekend:number,
        holidays: number,
        absent : number,
    }
    leave:{
        cl:number,
        sick:number,
        earn:number,
        meternity:number,
    },
    ot:{
        hours: number,
        rate:number,
        amount:number,
    },
    deduction:{
        advanced:number,
        absenteeism:number,
        loan:number,
        pf:number,
        others:number,
        tax:number
    }
}
