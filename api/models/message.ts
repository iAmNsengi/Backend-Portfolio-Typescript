import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  message_content: string;
}

const messageSchema: Schema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    sender_name: { type: String, required: true },
    sender_email: { type: String, required: true },
    sender_phone: { type: String, required: true },
    message_content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model < IMessage > ("Message", messageSchema);
