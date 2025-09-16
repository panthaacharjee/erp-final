import { Document, Schema, Types, model } from "mongoose";


export interface IBuyer extends Document {
    title: string;
    code:string;
    address:string;
    vendor: Types.ObjectId[] ;
}

export interface IVendor extends Document {
    title: string;
    code: string;
    contact: Types.ObjectId[];
    program: Types.ObjectId[]; 
}

interface IContactPerson extends Document {
    name: string;
    number: string;
    mail: string;
}


const BuyerSchema = new Schema<IBuyer>({
    title: {
        type:String,
        required:true,
    },
    code:{
        type:String,
        required:true
    },
    address:{
        type:String
    },
    vendor: [
        {
            type: Schema.Types.ObjectId,
            ref: "Vendor" 
        }
    ]
});

const VendorSchema = new Schema<IVendor>({
    title: {
        type:String,
    },
    code:{
        type:String,
    },
    contact: [
        {
            type: Schema.Types.ObjectId,
            ref: "ContactPerson" 
        }
    ],
    program:[
        {
            type: Schema.Types.ObjectId,
            ref:"program"
        }
    ]
});


const ContactPersonSchema = new Schema<IContactPerson>({
    name: String,
    number: String,
    mail: String,
});


const Buyer = model<IBuyer>("Buyer", BuyerSchema);
const Vendor = model<IVendor>('Vendor', VendorSchema);
const ContactPerson = model<IContactPerson>('ContactPerson', ContactPersonSchema);

export { Vendor, Buyer, ContactPerson };