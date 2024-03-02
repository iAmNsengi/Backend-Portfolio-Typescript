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
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("../app"));
const supertest_1 = __importDefault(require("supertest"));
const user_1 = __importDefault(require("../models/user"));
const promises_1 = __importDefault(require("fs/promises"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let token;
let id;
let commentid;
let messageid;
let projectid;
describe("Express App", () => {
    // Test for root route
    it("responds with status 404 for GET /", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default).get("/");
        expect(response.status).toBe(404);
    }));
    // Test for non-existent route
    it("responds with 404 for non-existent routes", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default).get("/non-existent-route");
        expect(response.status).toBe(404);
    }));
    // Test for CORS headers
    it("includes CORS headers in responses", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default).get("/");
        expect(response.headers["access-control-allow-origin"]).toBe("*");
        expect(response.headers["access-control-allow-headers"]).toBe("X-Requested-With, Content-Type, Accept, Authorization");
    }));
    // Test for MongoDB connection
    it("successfully connects to MongoDB", () => __awaiter(void 0, void 0, void 0, function* () {
        // Add your test logic here to verify MongoDB connection
        const response = yield mongoose_1.default.connect(process.env.DATABASE_URL);
        expect(response).toBeDefined();
    }));
    // Test for Swagger documentation endpoint
    it("serves Swagger documentation at /api-docs", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default).get("/api-docs/");
        expect(response.status).toBe(200);
    }));
    // Test for specific routes (you can add more tests for each route)
    describe("Blog Routes", () => {
        it("responds with status 200 for GET /api/v1/blogs", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default).get("/api/v1/blogs");
            expect(response.status).toBe(200);
        }));
    });
});
describe("users", () => {
    describe("user registration", () => {
        test("user registration with all data", () => __awaiter(void 0, void 0, void 0, function* () {
            const userInfo = {
                email: "test1@mail.com",
                password: "123456",
            };
            try {
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post("/api/v1/user/signup")
                    .send(userInfo);
                expect(response.statusCode).toBe(201);
                expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"));
            }
            catch (err) {
                throw err; // Re-throw the error to fail the test
            }
        }), 150000);
        test("user registration with missing properties users", () => __awaiter(void 0, void 0, void 0, function* () {
            const userInfo = {
                email: "aqweqweddddwdf@gmail.com",
            };
            try {
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post("/api/v1/user/signup")
                    .send(userInfo);
                expect(response.statusCode).toEqual(400);
                expect(response.body).toBeDefined();
            }
            catch (err) {
                throw err;
            }
        }));
        test("user registration with an existing email", () => __awaiter(void 0, void 0, void 0, function* () {
            const userInfo = {
                email: "test1@mail.com",
                password: "123456",
            };
            try {
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post("/api/v1/user/signup")
                    .send(userInfo);
                expect(response.statusCode).toEqual(409);
                expect(response.body).toBeDefined();
            }
            catch (err) {
                throw err;
            }
        }));
    });
    describe("user login", () => {
        test("User login when all data is provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const userLoginInfo = {
                email: "test1@mail.com",
                password: "123456",
            };
            try {
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post("/api/v1/user/login")
                    .send(userLoginInfo);
                expect(response.statusCode).toEqual(200);
                expect(response.status).toEqual(200);
                expect(response.body).toBeDefined();
                expect(typeof response.body.token).toBeDefined();
                expect(response.body.message).toBe("Auth successful");
                token = response.body.token;
            }
            catch (err) {
                throw err;
            }
        }));
        test("User login when some data isn't provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const userLoginInfo = {
                email: "test1@mail.com",
            };
            try {
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post("/api/v1/user/login")
                    .send(userLoginInfo);
                expect(response.statusCode).toEqual(401);
                expect(response.status).toEqual(401);
                expect(response.body).toBeDefined();
            }
            catch (err) {
                throw err;
            }
        }));
        test("User login when the credentials are wrong", () => __awaiter(void 0, void 0, void 0, function* () {
            const userLoginInfo = {
                email: "test1@mail.com",
                password: "67676767",
            };
            try {
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post("/api/v1/user/login")
                    .send(userLoginInfo);
                expect(response.statusCode).toEqual(401);
                expect(response.body).toBeDefined();
            }
            catch (err) {
                throw err;
            }
        }));
    });
});
describe("Blogs", () => {
    describe("Add blog", () => {
        it("Should add a blog when data is provided", () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const blogImage = yield promises_1.default.readFile(`test.jpg`);
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post("/api/v1/blogs")
                    .set("Authorization", "Bearer " + token)
                    .field("title", "Test title")
                    .field("content", "Content for the test")
                    .field("author", "test")
                    .attach("blogImage", blogImage, "test.jpg");
                expect(response.statusCode).toEqual(201);
                id = response.body.createdBlog._id;
            }
            catch (err) {
                throw err;
            }
        }));
    });
    it("Should throw an error when some data is missing", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const blogImage = yield promises_1.default.readFile(`test.jpg`);
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/v1/blogs")
                .set("Authorization", "Bearer " + token)
                .field("content", "Content for the test")
                .attach("blogImage", blogImage, "test.jpg");
            expect(response.statusCode).toEqual(400);
        }
        catch (err) {
            throw err;
        }
    }));
    it("Should throw an error if the token is not provided", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const blogImage = yield promises_1.default.readFile(`test.jpg`);
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/v1/blogs")
                .field("title", "Test title")
                .field("content", "Content for the test")
                .field("author", "test")
                .attach("blogImage", blogImage, "test.jpg");
            expect(response.statusCode).toEqual(401);
        }
        catch (err) {
            throw err;
        }
    }));
});
describe("update blogs", () => {
    it("Should update the blog when all data is provided", () => __awaiter(void 0, void 0, void 0, function* () {
        const updateInfo = {
            title: "new title",
            content: "new content",
            author: "new author",
        };
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .patch("/api/v1/blogs/" + id)
                .set("Authorization", "Bearer " + token)
                .send(updateInfo);
            expect(response.statusCode).toEqual(200);
            expect(response.status).toEqual(200);
        }
        catch (err) {
            throw err;
        }
    }));
    it("Should throw an error hence all data is not provided", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const blogImage = yield promises_1.default.readFile(`test.jpg`);
            const response = yield (0, supertest_1.default)(app_1.default)
                .patch("/api/v1/blogs/" + id)
                .set("Authorization", "Bearer " + token)
                .field("title", "Test title2")
                .field("content", "Content for the test 2")
                .attach("blogImage", blogImage, "test.jpg");
            expect(response.statusCode).toEqual(400);
            expect(response.status).toEqual(400);
        }
        catch (err) {
            throw err;
        }
    }));
});
describe("get blog post", () => {
    it("Should return the blog when it exists", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default).get("/api/v1/blogs/" + id);
            expect(response.statusCode).toEqual(200);
            expect(typeof response.body).toBeDefined();
        }
        catch (err) {
            throw err;
        }
    }));
    it("A Bad format of the Id", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default).get("/api/v1/blogs/" + id + "asdfa");
            expect(response.statusCode).toEqual(500);
        }
        catch (err) {
            throw err;
        }
    }));
    it("Should throw an error if there is no blog with the given id", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default).get("/api/v1/blogs/" + "65cf61377818ede2c9d0863a");
            expect(response.statusCode).toEqual(404);
        }
        catch (err) {
            throw err;
        }
    }));
});
describe("blogs", () => {
    it("should return all blogs", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default).get("/api/v1/blogs/");
            expect(response.statusCode).toEqual(200);
        }
        catch (err) {
            throw err;
        }
    }));
});
describe("comments", () => {
    it("all blog commets", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get("/api/v1/blogs/" + id + "/comments")
                .set("Authorization", "Bearer " + token);
            expect(response.statusCode).toEqual(200);
        }
        catch (err) {
            throw err;
        }
    }));
    it("should post a new blog post comment when everything is provided", () => __awaiter(void 0, void 0, void 0, function* () {
        const comment = {
            comment_content: "A good post",
        };
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/v1/blogs/" + id + "/comments")
                .set("Authorization", "Bearer " + token)
                .send(comment);
            commentid = response.body.createdComment._id;
            expect(response.statusCode).toEqual(201);
        }
        catch (err) {
            throw err;
        }
    }));
    it("should throw an error token missing", () => __awaiter(void 0, void 0, void 0, function* () {
        const comment = {
            comment_content: " A good post",
        };
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/v1/blogs/" + id + "/comments")
                .send(comment);
            expect(response.statusCode).toEqual(401);
            expect(response.status).toEqual(401);
        }
        catch (err) {
            throw err;
        }
    }));
    it("should throw an error comment content missing", () => __awaiter(void 0, void 0, void 0, function* () {
        const comment = {};
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/v1/blogs/" + id + "/comments")
                .set("Authorization", "Bearer " + token)
                .send(comment);
            expect(response.statusCode).toEqual(400);
            expect(response.status).toEqual(400);
        }
        catch (err) {
            throw err;
        }
    }));
    it("should delete comment when it exists", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete("/api/v1/blogs/" + id + "/comments/" + commentid)
                .set("Authorization", "Bearer " + token);
            expect(response.statusCode).toEqual(200);
            expect(response.status).toEqual(200);
        }
        catch (err) {
            throw err;
        }
    }));
    it("should  throw error deleting comment when  token is provided", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default).delete("/api/v1/blogs/" + id + "/comments/" + commentid);
            expect(response.statusCode).toEqual(401);
            expect(response.status).toEqual(401);
        }
        catch (err) {
            throw err;
        }
    }));
});
describe("delete a blog post", () => {
    it("Should delete the blog post when it exists", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete("/api/v1/blogs/" + id)
                .set("Authorization", "Bearer " + token);
            expect(response.statusCode).toEqual(200);
        }
        catch (err) {
            throw err;
        }
    }));
    it("Should throw error if there is no blog with given id", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get("/api/v1/blogs/" + "65cf61377818ede2c9d0863a")
                .set("Authorization", "Bearer " + token);
            expect(response.statusCode).toEqual(404);
        }
        catch (err) {
            throw err;
        }
    }));
});
describe("Messages", () => {
    it("Should get all Messages", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get("/api/v1/messages")
                .set("Authorization", "Bearer " + token);
            expect(response.statusCode).toEqual(200);
        }
        catch (err) {
            throw err;
        }
    }));
    it("Should post a new message", () => __awaiter(void 0, void 0, void 0, function* () {
        const the_message = {
            sender_name: "test",
            sender_email: "test@message.com",
            sender_phone: "07888888",
            message_content: "i want to hire you",
        };
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/v1/messages")
                .send(the_message);
            messageid = response.body._id;
            expect(response.statusCode).toEqual(201);
        }
        catch (err) {
            throw err;
        }
    }));
    it("Should get message", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get("/api/v1/messages/" + messageid)
                .set("Authorization", "Bearer " + token);
            expect(response.statusCode).toEqual(200);
        }
        catch (err) {
            throw err;
        }
    }));
    it("Should delete message", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete("/api/v1/messages/" + messageid)
                .set("Authorization", "Bearer " + token);
            expect(response.statusCode).toEqual(200);
        }
        catch (err) {
            throw err;
        }
    }));
    it("Should throw delete message error no token", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default).delete("/api/v1/messages/" + messageid);
            expect(response.statusCode).toEqual(401);
        }
        catch (err) {
            throw err;
        }
    }));
});
describe("Projects", () => {
    it("Should get all Projects", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default).get("/api/v1/projects");
            expect(response.statusCode).toEqual(200);
        }
        catch (err) {
            throw err;
        }
    }));
    it("Should post a new project", () => __awaiter(void 0, void 0, void 0, function* () {
        const projectImage = yield promises_1.default.readFile(`test.jpg`);
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/v1/projects")
                .field("title", "A new project")
                .field("link", "https://nsengi.onrender.com/api-docs/")
                .field("description", "It was a great project")
                .attach("image", projectImage, "test.jpg")
                .set("Authorization", "Bearer " + token);
            console.log(response.body);
            projectid = response.body.createdProject._id;
            expect(response.statusCode).toEqual(201);
        }
        catch (err) {
            throw err;
        }
    }));
    it("Should throw an error posting a new project no auth", () => __awaiter(void 0, void 0, void 0, function* () {
        const projectImage = yield promises_1.default.readFile(`test.jpg`);
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/v1/projects")
                .field("title", "A new project")
                .field("link", "https://nsengi.onrender.com/api-docs/")
                .field("description", "It was a great project")
                .attach("image", projectImage, "test.jpg");
            console.log(response.body);
            expect(response.statusCode).toEqual(401);
        }
        catch (err) {
            throw err;
        }
    }));
    it("Should throw an error posting a new project no image file", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .post("/api/v1/projects")
                .field("title", "A new project")
                .field("link", "https://nsengi.onrender.com/api-docs/")
                .field("description", "It was a great project")
                .set("Authorization", "Bearer " + token);
            console.log(response.body);
            expect(response.statusCode).toEqual(400);
        }
        catch (err) {
            throw err;
        }
    }));
    it("Should get project", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get("/api/v1/projects/" + projectid)
                .set("Authorization", "Bearer " + token);
            expect(response.statusCode).toEqual(200);
        }
        catch (err) {
            throw err;
        }
    }));
    it("Should edit project", () => __awaiter(void 0, void 0, void 0, function* () {
        const newData = {
            title: "Updated title",
            description: "Updated description",
            link: "https://nsengi.onrender.com/api-docs/",
        };
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .patch("/api/v1/projects/" + projectid)
                .set("Authorization", "Bearer " + token)
                .send(newData);
            expect(response.statusCode).toEqual(200);
        }
        catch (err) {
            throw err;
        }
    }));
    it("Should delete project", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default)
                .delete("/api/v1/projects/" + projectid)
                .set("Authorization", "Bearer " + token);
            expect(response.statusCode).toEqual(200);
        }
        catch (err) {
            throw err;
        }
    }));
    it("Should throw delete project error no token", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, supertest_1.default)(app_1.default).delete("/api/v1/projects/" + projectid);
            expect(response.statusCode).toEqual(401);
        }
        catch (err) {
            throw err;
        }
    }));
});
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield user_1.default.findOneAndDelete({
            email: "test1@mail.com",
        });
        yield mongoose_1.default.disconnect();
    }
    catch (err) {
        throw err;
    }
}), 150000);
