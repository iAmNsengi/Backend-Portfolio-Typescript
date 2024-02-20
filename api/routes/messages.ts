import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Message, { IMessage } from "../models/message";

const router = express.Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  Message.find()
    .select("_id sender_name sender_email sender_phone message_content")
    .exec()
    .then((docs: IMessage[]) => {
      res.status(200).json({
        count: docs.length,
        messages: docs.map((doc: IMessage) => ({
          _id: doc._id,
          sender_name: doc.sender_name,
          sender_email: doc.sender_email,
          sender_phone: doc.sender_phone,
          message_content: doc.message_content,
        })),
      });
    })
    .catch((err: any) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.post("/", (req: Request, res: Response, next: NextFunction) => {
  const message = new Message({
    _id: new mongoose.Types.ObjectId(),
    sender_name: req.body.sender_name,
    sender_email: req.body.sender_email,
    sender_phone: req.body.sender_phone,
    message_content: req.body.message_content,
  });
  message
    .save()
    .then((result: any) => {
      res.status(201).json(result);
    })
    .catch((err: any) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/:messageId", (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.messageId;
  Message.findById(id)
    .exec()
    .then((doc: IMessage | null) => {
      if (doc) res.status(200).json(doc);
      else
        res.status(404).json({
          message: "No Item with given entry was found!",
        });
    })
    .catch((err: any) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.delete(
  "/:messageId",
  (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.messageId;
    Message.deleteOne({ _id: id })
      .exec()
      .then((result: any) => {
        res.status(200).json({
          message: "Item removed Successfully",
        });
      })
      .catch((err: any) => {
        res.status(500).json({
          error: err,
        });
      });
  }
);

export default router;
