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
const promises_1 = __importDefault(require("fs/promises"));
const mongoose_1 = __importDefault(require("mongoose"));
let token;
let id;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    const userLoginInfo = {
        email: "test@mail.com",
        password: "123456",
    };
    const response = yield (0, supertest_1.default)(app_1.default)
        .post("/api/v1/user/login")
        .send(userLoginInfo);
    token = response.body.token;
}));
describe("Posts", () => {
    describe("add post", () => {
        test("If everything is provided", () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const blogImage = yield promises_1.default.readFile("../../Desktop/Backend/uploads/test.jpg");
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post("/api/v1/blogs")
                    .set("Authorization", "Bearer " + token)
                    .field("title", "Test title")
                    .field("description", "Description for the test")
                    .field("content", "Content for the test")
                    .field("author", "Test")
                    .attach("blogImage", blogImage, "test.jpg");
                expect(response.statusCode).toEqual(201);
                expect(typeof response.body).toEqual("object");
                expect(typeof response.body.blog).toEqual("object");
                id = response.body.data.blog.id;
            }
            catch (err) {
                throw err;
            }
        }));
        test("When some data are missing", () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const blogImage = yield promises_1.default.readFile("../../Desktop/Backend/uploads/test.jpg");
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post("/api/v1/blogs")
                    .set("Authorization", "Bearer " + token)
                    .field("description", "Description for the test")
                    .field("content", "Content for the test")
                    .field("author", "Test")
                    .attach("blogImage", blogImage, "test.jpg");
                expect(response.statusCode).toEqual(500);
            }
            catch (err) {
                throw err;
            }
        }));
        test("When there is not token", () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const blogImage = yield promises_1.default.readFile("../../Desktop/Backend/uploads/test.jpg");
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post("/api/v1/blogs")
                    .field("title", "Test title")
                    .field("description", "Description for the test")
                    .field("content", "Content for the test")
                    .field("author", "Test")
                    .attach("blogImage", blogImage, "test.jpg");
                expect(response.statusCode).toEqual(403);
            }
            catch (err) {
                throw err;
            }
        }));
    });
    //   describe("update articles", () => {
    //     test("When all data is provided", async () => {
    //       try {
    //         const blogImage = await fs.readFile(
    //           "../../Desktop/Backend/uploads/test.jpg"
    //         );
    //         const response = await request(app)
    //           .patch("/api/v1/articles/" + id)
    //           .set("Authorization", "Bearer " + token)
    //           .attach("blogImage", blogImage, "test.jpg");
    //         expect(response.statusCode).toEqual(200);
    //         expect(typeof response.body.data).toEqual("object");
    //         expect(typeof response.body.data.article).toEqual("object");
    //       } catch (err) {
    //         throw err;
    //       }
    //     });
    //     test("When there is not token", async () => {
    //       try {
    //         const blogImage = await fs.readFile(
    //           "../../Desktop/Backend/uploads/test.jpg"
    //         );
    //         const response = await request(app)
    //           .patch("/api/v1/articles/" + id)
    //           .attach("blogImage", blogImage, "test.jpg");
    //         expect(response.statusCode).toEqual(403);
    //       } catch (err) {
    //         throw err;
    //       }
    //     });
    //   });
    //   describe("get article", () => {
    //     test("when article exists", async () => {
    //       try {
    //         const response = await request(app).get("/api/v1/articles/" + id);
    //         expect(response.statusCode).toEqual(200);
    //         expect(typeof response.body.data).toEqual("object");
    //         expect(typeof response.body.data.article).toEqual("object");
    //       } catch (err) {
    //         throw err;
    //       }
    //     });
    //     test("Bad id format", async () => {
    //       try {
    //         const response = await request(app).get(
    //           "/api/v1/articles/" + id + "asdfa"
    //         );
    //         expect(response.statusCode).toEqual(500);
    //         expect(typeof response.body.message).toEqual("string");
    //       } catch (err) {
    //         throw err;
    //       }
    //     });
    //     test("when doesn't exist article exists", async () => {
    //       try {
    //         const response = await request(app).get(
    //           "/api/v1/articles/" + "65cf61377818ede2c9d0863a"
    //         );
    //         expect(response.statusCode).toEqual(404);
    //         expect(typeof response.body.message).toEqual("string");
    //       } catch (err) {
    //         throw err;
    //       }
    //     });
    //   });
    //   describe("get articles", () => {
    //     test("articles", async () => {
    //       try {
    //         const response = await request(app).get("/api/v1/articles/");
    //         expect(response.statusCode).toEqual(200);
    //         expect(typeof response.body.data).toEqual("object");
    //       } catch (err) {
    //         throw err;
    //       }
    //     });
    //   });
    //   describe("delete article", () => {
    //     test("when article exists", async () => {
    //       try {
    //         const response = await request(app)
    //           .delete("/api/v1/articles/" + id)
    //           .set("Authorization", "Bearer " + token);
    //         expect(response.statusCode).toEqual(200);
    //       } catch (err) {
    //         throw err;
    //       }
    //     });
    //     test("Bad id format", async () => {
    //       try {
    //         const response = await request(app)
    //           .get("/api/v1/articles/" + id + "asdfa")
    //           .set("Authorization", "Bearer " + token);
    //         expect(response.statusCode).toEqual(500);
    //         expect(typeof response.body.message).toEqual("string");
    //       } catch (err) {
    //         throw err;
    //       }
    //     });
    //     test("when doesn't exist article exists", async () => {
    //       try {
    //         const response = await request(app)
    //           .get("/api/v1/articles/" + "65cf61377818ede2c9d0863a")
    //           .set("Authorization", "Bearer " + token);
    //         expect(response.statusCode).toEqual(404);
    //         expect(typeof response.body.message).toEqual("string");
    //       } catch (err) {
    //         throw err;
    //       }
    //     });
    //   });
    // });
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.disconnect();
        }
        catch (err) {
            throw err;
        }
    }));
});
