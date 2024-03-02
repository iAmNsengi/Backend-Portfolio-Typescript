import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
}

const userSchema: Schema = new Schema({
  _id: { type: Schema.Types.ObjectId, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: { type: String, required: true },
  isSuperUser : {type: Boolean, default: false},
});

export default mongoose.model < IUser > ("User", userSchema);
