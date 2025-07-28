import { model, Schema } from "mongoose";
import { SalaryInterface } from "./SalaryInterface";

const salarySchema = new Schema<SalaryInterface>({
    user:{
        type:Schema.Types.ObjectId,
        ref: "user"
    },
    date:{
        type:Date
    },
    salary:{
        main:Number,
        basic:Number,
        home:Number,
        food:Number,
        medical:Number,
        conveyance:Number,
        special:Number
    },
    attendence:{
        present: Number,
        weekend: Number,
        holidays: Number,
        absent : Number,
    },
    leave:{
        cl: Number,
        sick: Number,
        earn: Number,
        meternity: Number,
    },
    ot:{
        hours: Number,
        rate: Number,
        amount: Number,
    },
    deduction:{
        advanced:Number,
        absenteeism:Number,
        loan:Number,
        pf: Number,
        others:Number,
        tax:Number
    }
})


export default model<SalaryInterface>('salary', salarySchema)