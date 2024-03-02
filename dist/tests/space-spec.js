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
    yield (0, supertest_1.default)(app_1.default).post("/api/v1/users/signup").send(userLoginInfo);
    const response = yield (0, supertest_1.default)(app_1.default)
        .post("/api/v1/users/login")
        .send(userLoginInfo);
    token = response.body.token;
}), 150000);
describe("Blogs", () => {
    describe("add blog", () => {
        it("Should add a blog when data is provided", () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const bannerImage = yield promises_1.default.readFile(`uploads/test.jpg`);
                const response = yield (0, supertest_1.default)(app_1.default)
                    .post("/api/v1/blogs")
                    .set("Authorization", "Bearer " + token)
                    .field("title", "Test title")
                    .field("description", "Description for the test")
                    .field("content", "Content for the test")
                    .field("author", "test")
                    .attach("blogImage", bannerImage, "test.jpg");
                expect(response.statusCode).toEqual(201);
                console.log(response);
                id = response.body.blog._id;
            }
            catch (err) {
                throw err;
            }
        }));
    });
    // it("Should throw an error when some data is missing", async () => {
    //   try {
    //     const bannerImage = await fs.readFile(
    //       `uploads/article_banner_image.jpg`
    //     );
    //     const response = await request(app)
    //       .post("/api/v1/articles")
    //       .set("Authorization", "Bearer " + token)
    //       .field("title", "Test title")
    //       .field("content", "Content for the test")
    //       .field("isPublished", true)
    //       .attach("bannerImage", bannerImage, "article_banner_image.jpg");
    //     expect(response.statusCode).toEqual(500);
    //   } catch (err) {
    //     throw err;
    //   }
    // });
    // it("Should throw an error if the token is not provided", async () => {
    //   try {
    //     const bannerImage = await fs.readFile(
    //       `uploads/article_banner_image.jpg`
    //     );
    //     const response = await request(app)
    //       .post("/api/v1/articles")
    //       .field("title", "Test title")
    //       .field("content", "Content for the test")
    //       .field("isPublished", true)
    //       .attach("bannerImage", bannerImage, "article_banner_image.jpg");
    //     expect(response.statusCode).toEqual(403);
    //   } catch (err) {
    //     throw err;
    //   }
    // });
});
//   describe("update articles", () => {
//     it("Should update the article when all data is provided", async () => {
//       try {
//         const bannerImage = await fs.readFile(
//           `uploads/article_banner_image.jpg`
//         );
//         const response = await request(app)
//           .patch("/api/v1/articles/" + id)
//           .set("Authorization", "Bearer " + token)
//           .attach("bannerImage", bannerImage, "article_banner_image.jpg");
//         expect(response.statusCode).toEqual(200);
//         expect(typeof response.body.data).toEqual("object");
//         expect(typeof response.body.data.article).toEqual("object");
//       } catch (err) {
//         throw err;
//       }
//     });
//     it("Should throw an error if the token is not provided", async () => {
//       try {
//         const bannerImage = await fs.readFile(
//           `uploads/article_banner_image.jpg`
//         );
//         const response = await request(app)
//           .patch("/api/v1/articles/" + id)
//           .attach("bannerImage", bannerImage, "article_banner_image.jpg");
//         expect(response.statusCode).toEqual(403);
//       } catch (err) {
//         throw err;
//       }
//     });
//   });
//   describe("get article", () => {
//     it("Should return the article if it exists", async () => {
//       try {
//         const response = await request(app).get("/api/v1/articles/" + id);
//         expect(response.statusCode).toEqual(200);
//         expect(typeof response.body.data).toEqual("object");
//         expect(typeof response.body.data.article).toEqual("object");
//       } catch (err) {
//         throw err;
//       }
//     });
//     it("Bad id format", async () => {
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
//     it("Should throw an error if there is no article with the given id", async () => {
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
//     it("articles", async () => {
//       try {
//         const response = await request(app).get("/api/v1/articles/");
//         expect(response.statusCode).toEqual(200);
//         expect(typeof response.body.data).toEqual("object");
//         expect(typeof response.body.data.articles).toEqual("object");
//       } catch (err) {
//         throw err;
//       }
//     });
//   });
//   describe("delete article", () => {
//     it("Should delete the article if it exists", async () => {
//       try {
//         const response = await request(app)
//           .delete("/api/v1/articles/" + id)
//           .set("Authorization", "Bearer " + token);
//         expect(response.statusCode).toEqual(200);
//       } catch (err) {
//         throw err;
//       }
//     });
//     it("Should throw error if there is no article with given id", async () => {
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
