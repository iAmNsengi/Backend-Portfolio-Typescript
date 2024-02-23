import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Message, { IMessage } from "../models/message";
import Joi from "joi";

const router = express.Router();

// Joi schema for message request body validation
const messageSchema = Joi.object({
  sender_name: Joi.string().required(),
  sender_email: Joi.string().email().required(),
  sender_phone: Joi.string().required(),
  message_content: Joi.string().required(),
});


/**
 * @swagger
 * /api/v1/messages:
 *   get:
 *     summary: Retrieve all messages
 *     description: Retrieve a list of all messages.
 *     responses:
 *       '200':
 *         description: A list of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Number of messages
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *       '500':
 *         description: Internal server error
 */

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

/**
 * @swagger
 * /api/v1/messages:
 *   post:
 *     summary: Create a new message
 *     description: Create a new message with sender details and content.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Message'
 *     responses:
 *       '201':
 *         description: Message created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       '400':
 *         description: Bad request, validation error
 *       '500':
 *         description: Internal server error
 */
router.post("/", (req: Request, res: Response, next: NextFunction) => {
  // Validate request body against Joi schema
  const { error, value } = messageSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const message = new Message({
    _id: new mongoose.Types.ObjectId(),
    sender_name: value.sender_name,
    sender_email: value.sender_email,
    sender_phone: value.sender_phone,
    message_content: value.message_content,
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


/**
 * @swagger
 * /api/v1/messages/{messageId}:
 *   get:
 *     summary: Retrieve a message by ID
 *     description: Retrieve a message by its unique ID.
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         description: ID of the message to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A single message object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       '404':
 *         description: Message not found
 *       '500':
 *         description: Internal server error
 */
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


/**
 * @swagger
 * /api/v1/messages/{messageId}:
 *   delete:
 *     summary: Delete a message by ID
 *     description: Delete a message by its unique ID.
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         description: ID of the message to delete
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Message deleted successfully
 *       '404':
 *         description: Message not found
 *       '500':
 *         description: Internal server error
 */
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
