"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const message_1 = __importDefault(require("../models/message"));
const router = express_1.default.Router();
router.get("/", (req, res, next) => {
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
router.post("/", (req, res, next) => {
    const message = new message_1.default({
        _id: new mongoose_1.default.Types.ObjectId(),
        sender_name: req.body.sender_name,
        sender_email: req.body.sender_email,
        sender_phone: req.body.sender_phone,
        message_content: req.body.message_content,
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
router.delete("/:messageId", (req, res, next) => {
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
