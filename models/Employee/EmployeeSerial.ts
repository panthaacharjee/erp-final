import {Model, Schema, model} from "mongoose"

interface ICounter extends Document{
    id:string,
    seq:number
}

const counterSchema = new Schema<ICounter>({
  id: { type: String, required: true },
  seq: { type: Number, default: 1 }
});


const Counter: Model<ICounter> = model<ICounter>('Counter', counterSchema);

export default Counter;