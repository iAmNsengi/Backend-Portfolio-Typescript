"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const message_1 = __importDefault(require("../models/message"));
const joi_1 = __importDefault(require("joi"));
const check_auth_1 = __importDefault(require("../middleware/check-auth"));
const router = express_1.default.Router();
// Joi schema for message request body validation
const messageSchema = joi_1.default.object({
    sender_name: joi_1.default.string().required(),
    sender_email: joi_1.default.string().email().required(),
    sender_phone: joi_1.default.string().required(),
    message_content: joi_1.default.string().required(),
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
 *       '500':
 *         description: Internal server error
 */
router.get("/", check_auth_1.default, (req, res, next) => {
    message_1.default.find()
        .select("_id sender_name sender_email sender_phone message_content")
        .exec()
        .then((docs) => {
        res.status(200).json({
            count: docs.length,
            messages: docs.map((doc) => ({
                _id: doc._id,
                sender_name: doc.sender_name,
                sender_email: doc.sender_email,
                sender_phone: doc.sender_phone,
                message_content: doc.message_content,
            })),
        });
    })
        .catch((err) => {
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
 *             type: object
 *           properties:
 *             sender_name:
 *               type: string
 *     responses:
 *       '201':
 *         description: Message created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       '400':
 *         description: Bad request, validation error
 *       '500':
 *         description: Internal server error
 */
router.post("/", (req, res, next) => {
    // Validate request body against Joi schema
    const { error, value } = messageSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const message = new message_1.default({
        _id: new mongoose_1.default.Types.ObjectId(),
        sender_name: value.sender_name,
        sender_email: value.sender_email,
        sender_phone: value.sender_phone,
        message_content: value.message_content,
    });
    message
        .save()
        .then((result) => {
        res.status(201).json(result);
    })
        .catch((err) => {
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
 *               type: object
 *       '404':
 *         description: Message not found
 *       '500':
 *         description: Internal server error
 */
router.get("/:messageId", (req, res, next) => {
    const id = req.params.messageId;
    message_1.default.findById(id)
        .exec()
        .then((doc) => {
        if (doc)
            res.status(200).json(doc);
        else
            res.status(404).json({
                message: "No Item with given entry was found!",
            });
    })
        .catch((err) => {
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
router.delete("/:messageId", check_auth_1.default, (req, res, next) => {
    const id = req.params.messageId;
    message_1.default.deleteOne({ _id: id })
        .exec()
        .then((result) => {
        res.status(200).json({
            message: "Item removed Successfully",
        });
    })
        .catch((err) => {
        res.status(500).json({
            error: err,
        });
    });
});
exports.default = router;
