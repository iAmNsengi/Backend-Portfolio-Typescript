import mongoose, { Schema, Document } from "mongoose";

export interface IBlog extends Document {
  title: string;
  author: string;
  content: string;
  blogImage: string;
}

const blogSchema: Schema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    content: { type: String, required: true },
    blogImage: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBlog>("Blog", blogSchema);
