import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  postId: Schema.Types.ObjectId;
  comment_by: Schema.Types.ObjectId;
  comment_content: string;
}

const commentSchema: Schema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    postId: { type: Schema.Types.ObjectId, required: true },
    comment_by: { type: Schema.Types.ObjectId, required: true },
    comment_content: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IComment>("Comment", commentSchema);
