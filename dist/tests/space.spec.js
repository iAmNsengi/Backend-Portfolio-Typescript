"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../app"));
const supertest_1 = __importDefault(require("supertest"));
const body_parser_1 = __importDefault(require("body-parser"));
const blogs_1 = __importDefault(require("../routes/blogs"));
// Mocking modules
jest.mock("../models/blog");
jest.mock("../models/comment");
jest.mock("../middleware/check-auth");
app_1.default.use(body_parser_1.default.json());
app_1.default.use("/api/v1/blogs", blogs_1.default);
describe("User Routes", () => {
    it("should throw a data validation error registering the user", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/v1/user/signup")
                .send({ email: "", password: "" });
            expect(response.status).toBe(400);
        }
        catch (err) {
            console.log(err);
        }
    }));
    it("should throw a data validation error registering the user", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/v1/user/signup")
                .send({ email: "test@mail.com", password: "" });
            expect(response.status).toBe(400);
        }
        catch (err) {
            console.log(err);
        }
    }));
    it("should throw a data validation error registering the user due to short password length", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/v1/user/signup")
                .send({ email: "test@mail.com", password: "12" });
            expect(response.status).toBe(400);
        }
        catch (err) {
            console.log(err);
        }
    }));
    it("should register a new user", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/v1/user/signup")
                .send({ email: "test@example.com", password: "password123" });
            expect(response.status).toBe(201);
        }
        catch (err) {
            console.log(err);
        }
    }));
    it("should throw a conflic error registering the user", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/v1/user/signup")
                .send({ email: "test@example.com", password: "password123" });
            expect(response.status).toBe(409);
        }
        catch (err) {
            console.log(err);
        }
    }));
    it(" Should throw a not found error", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/v1/user/login")
                .send({ email: "test@example.com", password: "password12345" });
            expect(response.status).toBe(404);
        }
        catch (err) {
            console.log(err);
        }
    }));
    it(" Should login user", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/v1/user/login")
                .send({ email: "test@example.com", password: "password123" });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("token");
        }
        catch (err) {
            console.log(err);
        }
    }));
});
describe("GET /api/v1/blogs", () => {
    it("should get all blogs", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default).get("/api/v1/blogs");
        expect(response.status).toBe(200);
    }));
});
