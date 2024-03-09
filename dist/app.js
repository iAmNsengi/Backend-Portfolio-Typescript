"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggerOptions_1 = __importDefault(require("./swaggerOptions"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
// Middleware
app.use((0, morgan_1.default)("dev"));
app.use("/uploads", express_1.default.static("uploads"));
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
// CORS Middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});
// MongoDB Connection
mongoose_1.default.connect(process.env.DATABASE_URL);
mongoose_1.default.Promise = global.Promise;
// Swagger Documentation
const specs = (0, swagger_jsdoc_1.default)(swaggerOptions_1.default);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
// Routes
const blogs_1 = __importDefault(require("./routes/blogs"));
const messages_1 = __importDefault(require("./routes/messages"));
const user_1 = __importDefault(require("./routes/user"));
const projects_1 = __importDefault(require("./routes/projects"));
app.use("/api/v1/blogs", blogs_1.default);
app.use("/api/v1/messages", messages_1.default);
app.use("/api/v1/user", user_1.default);
app.use("/api/v1/projects", projects_1.default);
// Error Handling
app.use((req, res, next) => {
    const error = new Error("Page Not Found, might be a wrong request!");
    error.status = 404;
    next(error);
});
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        },
    });
});
exports.default = app;
