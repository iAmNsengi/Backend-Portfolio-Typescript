"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = __importDefault(require("../models/user"));
const signUpUser = (req, res, next) => {
    const { email, password } = req.body;
    user_1.default.findOne({ email })
        .exec()
        .then((user) => {
        if (user) {
            return res.status(409).json({
                message: "Email Already exists",
            });
        }
        else {
            bcrypt_1.default.hash(password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }
                else {
                    const newUser = new user_1.default({
                        _id: new mongoose_1.default.Types.ObjectId(),
                        email: email,
                        password: hash,
                    });
                    newUser
                        .save()
                        .then((result) => {
                        console.log(result);
                        res.status(201).json({
                            message: "User created!",
                        });
                    })
                        .catch((err) => {
                        res.status(500).json({
                            error: err,
                        });
                    });
                }
            });
        }
    })
        .catch((err) => {
        res.status(500).json({
            error: err,
        });
    });
};
exports.default = signUpUser;
