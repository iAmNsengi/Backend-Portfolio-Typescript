"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const checkAuth = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            throw new Error("Authorization failed");
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_KEY);
        req.userData = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({
            message: "Authorization failed",
        });
    }
};
exports.default = checkAuth;
