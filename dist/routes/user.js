"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_1 = __importDefault(require("../models/user"));
const user_2 = __importDefault(require("../controllers/user"));
const joi_1 = __importDefault(require("joi"));
dotenv_1.default.config();
const router = express_1.default.Router();
// Joi schema for signup request body validation
const signUpSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
});
router.post("/signup", (req, res, next) => {
    // Validate request body against Joi schema
    const { error, value } = signUpSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    (0, user_2.default)(req, res, next);
});
router.post("/login", (req, res, next) => {
    const { email, password } = req.body;
    user_1.default.findOne({ email })
        .exec()
        .then((user) => {
        if (!user) {
            return res.status(401).json({
                message: "Authentication failed",
            });
        }
        bcrypt_1.default.compare(password, user.password, (err, result) => {
            if (err || !result) {
                return res.status(401).json({
                    message: "Authentication failed",
                });
            }
            const token = jsonwebtoken_1.default.sign({
                email: user.email,
                userId: user._id,
            }, process.env.JWT_KEY, {
                expiresIn: "1h",
            });
            res.status(200).json({
                message: "Auth successful",
                token: token,
            });
        });
    })
        .catch((err) => {
        console.log(err);
        res.status(500).json({ error: err });
    });
});
router.delete("/:userId", (req, res, next) => {
    const id = req.params.userId;
    user_1.default.deleteOne({ _id: id })
        .exec()
        .then((result) => {
        res.status(200).json({
            message: "User account deleted Successfully",
        });
    })
        .catch((err) => {
        res.status(500).json({ error: err });
    });
});
exports.default = router;
