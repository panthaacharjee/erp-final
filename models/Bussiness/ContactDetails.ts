import { Document, Schema, Types, model } from "mongoose";


interface IBuyer extends Document {
    title: string;
    code:string;
    address:string;
    vendor: Types.ObjectId[];
}

interface IVendor extends Document {
    title: string;
    code: string;
    contact: Types.ObjectId[];
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
        unique:true
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
        required:true,
        unique:true,
    },
    code:{
        type:String,
    },
    contact: [
        {
            type: Schema.Types.ObjectId,
            ref: "ContactPerson" 
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