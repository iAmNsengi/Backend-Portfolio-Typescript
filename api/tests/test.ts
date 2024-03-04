import mongoose from "mongoose";
import app from "../app";
import request from "supertest";
import User from "../models/user";
import Blog from "../models/blog";
import fs from "fs/promises";
import dotenv from "dotenv";

dotenv.config();

let token: string;
let id: string;
let commentid: string;
let messageid: string;
let projectid: string;

describe("Express App", () => {
  // Test for root route
  it("responds with status 404 for GET /", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(404);
  });

  // Test for non-existent route
  it("responds with 404 for non-existent routes", async () => {
    const response = await request(app).get("/non-existent-route");
    expect(response.status).toBe(404);
  });

  // Test for CORS headers
  it("includes CORS headers in responses", async () => {
    const response = await request(app).get("/");
    expect(response.headers["access-control-allow-origin"]).toBe("*");
    expect(response.headers["access-control-allow-headers"]).toBe(
      "X-Requested-With, Content-Type, Accept, Authorization"
    );
  });

  // Test for MongoDB connection
  it("successfully connects to MongoDB", async () => {
    // Add your test logic here to verify MongoDB connection
    const response = await mongoose.connect(process.env.DATABASE_URL!);
    expect(response).toBeDefined();
  });

  // Test for Swagger documentation endpoint
  it("serves Swagger documentation at /api-docs", async () => {
    const response = await request(app).get("/api-docs/");
    expect(response.status).toBe(200);
  });

  // Test for specific routes (you can add more tests for each route)
  describe("Blog Routes", () => {
    it("responds with status 200 for GET /api/v1/blogs", async () => {
      const response = await request(app).get("/api/v1/blogs");
      expect(response.status).toBe(200);
    });
  });
});

describe("users", () => {
  describe("user registration", () => {
    test("user registration with all data", async () => {
      const userInfo = {
        email: "test1@mail.com",
        password: "123456",
      };

      try {
        const response = await request(app)
          .post("/api/v1/user/signup")
          .send(userInfo);

        expect(response.statusCode).toBe(201);

        expect(response.headers["content-type"]).toEqual(
          expect.stringContaining("json")
        );
      } catch (err) {
        throw err; 
      }
    }, 150000);

    test("user registration with missing properties users", async () => {
      const userInfo = {
        email: "aqweqweddddwdf@gmail.com",
      };

      try {
        const response = await request(app)
          .post("/api/v1/user/signup")
          .send(userInfo);

        expect(response.statusCode).toEqual(400);
        expect(response.body).toBeDefined();
      } catch (err) {
        throw err;
      }
    });

    test("user registration with an existing email", async () => {
      const userInfo = {
        email: "test1@mail.com",
        password: "123456",
      };

      try {
        const response = await request(app)
          .post("/api/v1/user/signup")
          .send(userInfo);
        expect(response.statusCode).toEqual(409);
        expect(response.body).toBeDefined();
      } catch (err) {
        throw err;
      }
    });
  });

  describe("user login", () => {
    test("User login when all data is provided", async () => {
      const userLoginInfo = {
        email: "test1@mail.com",
        password: "123456",
      };

      try {
        const response = await request(app)
          .post("/api/v1/user/login")
          .send(userLoginInfo);

        expect(response.statusCode).toEqual(200);
        expect(response.status).toEqual(200);

        expect(response.body).toBeDefined();
        expect(typeof response.body.token).toBeDefined();
        expect(response.body.message).toBe("Auth successful");

        token = response.body.token;
      } catch (err) {
        throw err;
      }
    });
    test("User login when some data isn't provided", async () => {
      const userLoginInfo = {
        email: "test1@mail.com",
      };

      try {
        const response = await request(app)
          .post("/api/v1/user/login")
          .send(userLoginInfo);

        expect(response.statusCode).toEqual(401);
        expect(response.status).toEqual(401);

        expect(response.body).toBeDefined();
      } catch (err) {
        throw err;
      }
    });

    test("User login when the credentials are wrong", async () => {
      const userLoginInfo = {
        email: "test1@mail.com",
        password: "67676767",
      };

      try {
        const response = await request(app)
          .post("/api/v1/user/login")
          .send(userLoginInfo);

        expect(response.statusCode).toEqual(401);
        expect(response.body).toBeDefined();
      } catch (err) {
        throw err;
      }
    });
  });
});

describe("Blogs", () => {
  describe("Add blog", () => {
    it("Should add a blog when data is provided", async () => {
      try {
        const blogImage = await fs.readFile(`test.jpg`);

        const response = await request(app)
          .post("/api/v1/blogs")
          .set("Authorization", "Bearer " + token)
          .field("title", "Test title")
          .field("content", "Content for the test")
          .field("author", "test")
          .attach("blogImage", blogImage, "test.jpg");

        expect(response.statusCode).toEqual(201);
        id = response.body.createdBlog._id;
      } catch (err) {
        throw err;
      }
    });
  });

  it("Should throw an error when some data is missing", async () => {
    try {
      const blogImage = await fs.readFile(`test.jpg`);
      const response = await request(app)
        .post("/api/v1/blogs")
        .set("Authorization", "Bearer " + token)
        .field("content", "Content for the test")
        .attach("blogImage", blogImage, "test.jpg");

      expect(response.statusCode).toEqual(400);
    } catch (err) {
      throw err;
    }
  });

  it("Should throw an error if the token is not provided", async () => {
    try {
      const blogImage = await fs.readFile(`test.jpg`);

      const response = await request(app)
        .post("/api/v1/blogs")
        .field("title", "Test title")
        .field("content", "Content for the test")
        .field("author", "test")
        .attach("blogImage", blogImage, "test.jpg");
      expect(response.statusCode).toEqual(401);
    } catch (err) {
      throw err;
    }
  });
});
describe("update blogs", () => {
  it("Should update the blog when all data is provided", async () => {
    const updateInfo = {
      title: "new title",
      content: "new content",
      author: "new author",
    };

    try {
      const response = await request(app)
        .patch("/api/v1/blogs/" + id)
        .set("Authorization", "Bearer " + token)
        .send(updateInfo);

      expect(response.statusCode).toEqual(200);
      expect(response.status).toEqual(200);
    } catch (err) {
      throw err;
    }
  });
  it("Should throw an error hence all data is not provided", async () => {
    try {
      const blogImage = await fs.readFile(`test.jpg`);

      const response = await request(app)
        .patch("/api/v1/blogs/" + id)
        .set("Authorization", "Bearer " + token)
        .field("title", "Test title2")
        .field("content", "Content for the test 2")
        .attach("blogImage", blogImage, "test.jpg");

      expect(response.statusCode).toEqual(400);
      expect(response.status).toEqual(400);
    } catch (err) {
      throw err;
    }
  });
});

describe("get blog post", () => {
  it("Should return the blog when it exists", async () => {
    try {
      const response = await request(app).get("/api/v1/blogs/" + id);

      expect(response.statusCode).toEqual(200);
      expect(typeof response.body).toBeDefined();
    } catch (err) {
      throw err;
    }
  });

  it("A Bad format of the Id", async () => {
    try {
      const response = await request(app).get("/api/v1/blogs/" + id + "asdfa");

      expect(response.statusCode).toEqual(500);
    } catch (err) {
      throw err;
    }
  });

  it("Should throw an error if there is no blog with the given id", async () => {
    try {
      const response = await request(app).get(
        "/api/v1/blogs/" + "65cf61377818ede2c9d0863a"
      );

      expect(response.statusCode).toEqual(404);
    } catch (err) {
      throw err;
    }
  });
});

describe("blogs", () => {
  it("should return all blogs", async () => {
    try {
      const response = await request(app).get("/api/v1/blogs/");

      expect(response.statusCode).toEqual(200);
    } catch (err) {
      throw err;
    }
  });
});

describe("comments", () => {
  it("all blog commets", async () => {
    try {
      const response = await request(app)
        .get("/api/v1/blogs/" + id + "/comments")
        .set("Authorization", "Bearer " + token);

      expect(response.statusCode).toEqual(200);
    } catch (err) {
      throw err;
    }
  });
  it("should post a new blog post comment when everything is provided", async () => {
    const comment = {
      comment_content: "A good post",
    };

    try {
      const response = await request(app)
        .post("/api/v1/blogs/" + id + "/comments")
        .set("Authorization", "Bearer " + token)
        .send(comment);

      commentid = response.body.createdComment._id;
      expect(response.statusCode).toEqual(201);
    } catch (err) {
      throw err;
    }
  });
  it("should throw an error token missing", async () => {
    const comment = {
      comment_content: " A good post",
    };

    try {
      const response = await request(app)
        .post("/api/v1/blogs/" + id + "/comments")
        .send(comment);

      expect(response.statusCode).toEqual(401);
      expect(response.status).toEqual(401);
    } catch (err) {
      throw err;
    }
  });
  it("should throw an error comment content missing", async () => {
    const comment = {};
    try {
      const response = await request(app)
        .post("/api/v1/blogs/" + id + "/comments")
        .set("Authorization", "Bearer " + token)
        .send(comment);

      expect(response.statusCode).toEqual(400);
      expect(response.status).toEqual(400);
    } catch (err) {
      throw err;
    }
  });
  it("should delete comment when it exists", async () => {
    try {
      const response = await request(app)
        .delete("/api/v1/blogs/" + id + "/comments/" + commentid)
        .set("Authorization", "Bearer " + token);

      expect(response.statusCode).toEqual(200);
      expect(response.status).toEqual(200);
    } catch (err) {
      throw err;
    }
  });
  it("should  throw error deleting comment when  token is provided", async () => {
    try {
      const response = await request(app).delete(
        "/api/v1/blogs/" + id + "/comments/" + commentid
      );
      expect(response.statusCode).toEqual(401);
      expect(response.status).toEqual(401);
    } catch (err) {
      throw err;
    }
  });
});

describe("delete a blog post", () => {
  it("Should delete the blog post when it exists", async () => {
    try {
      const response = await request(app)
        .delete("/api/v1/blogs/" + id)
        .set("Authorization", "Bearer " + token);
      expect(response.statusCode).toEqual(200);
    } catch (err) {
      throw err;
    }
  });

  it("Should throw error if there is no blog with given id", async () => {
    try {
      const response = await request(app)
        .get("/api/v1/blogs/" + "65cf61377818ede2c9d0863a")
        .set("Authorization", "Bearer " + token);

      expect(response.statusCode).toEqual(404);
    } catch (err) {
      throw err;
    }
  });
});

describe("Messages", () => {
  it("Should get all Messages", async () => {
    try {
      const response = await request(app)
        .get("/api/v1/messages")
        .set("Authorization", "Bearer " + token);
      expect(response.statusCode).toEqual(200);
    } catch (err) {
      throw err;
    }
  });

  it("Should post a new message", async () => {
    const the_message = {
      sender_name: "test",
      sender_email: "test@message.com",
      sender_phone: "07888888",
      message_content: "i want to hire you",
    };
    try {
      const response = await request(app)
        .post("/api/v1/messages")
        .send(the_message);

      messageid = response.body._id;

      expect(response.statusCode).toEqual(201);
    } catch (err) {
      throw err;
    }
  });
  it("Should get message", async () => {
    try {
      const response = await request(app)
        .get("/api/v1/messages/" + messageid)
        .set("Authorization", "Bearer " + token);

      expect(response.statusCode).toEqual(200);
    } catch (err) {
      throw err;
    }
  });
  it("Should delete message", async () => {
    try {
      const response = await request(app)
        .delete("/api/v1/messages/" + messageid)
        .set("Authorization", "Bearer " + token);

      expect(response.statusCode).toEqual(200);
    } catch (err) {
      throw err;
    }
  });
  it("Should throw delete message error no token", async () => {
    try {
      const response = await request(app).delete(
        "/api/v1/messages/" + messageid
      );

      expect(response.statusCode).toEqual(401);
    } catch (err) {
      throw err;
    }
  });
});

describe("Projects", () => {
  it("Should get all Projects", async () => {
    try {
      const response = await request(app).get("/api/v1/projects");
      expect(response.statusCode).toEqual(200);
    } catch (err) {
      throw err;
    }
  });

  it("Should post a new project", async () => {
    const projectImage = await fs.readFile(`test.jpg`);

    try {
      const response = await request(app)
        .post("/api/v1/projects")
        .field("title", "A new project")
        .field("link", "https://nsengi.onrender.com/api-docs/")
        .field("description", "It was a great project")
        .attach("image", projectImage, "test.jpg")
        .set("Authorization", "Bearer " + token);

      console.log(response.body);
      projectid = response.body.createdProject._id;

      expect(response.statusCode).toEqual(201);
    } catch (err) {
      throw err;
    }
  });
  it("Should throw an error posting a new project no auth", async () => {
    const projectImage = await fs.readFile(`test.jpg`);

    try {
      const response = await request(app)
        .post("/api/v1/projects")
        .field("title", "A new project")
        .field("link", "https://nsengi.onrender.com/api-docs/")
        .field("description", "It was a great project")
        .attach("image", projectImage, "test.jpg");

      console.log(response.body);

      expect(response.statusCode).toEqual(401);
    } catch (err) {
      throw err;
    }
  });
  it("Should throw an error posting a new project no image file", async () => {
    try {
      const response = await request(app)
        .post("/api/v1/projects")
        .field("title", "A new project")
        .field("link", "https://nsengi.onrender.com/api-docs/")
        .field("description", "It was a great project")
        .set("Authorization", "Bearer " + token);

      console.log(response.body);

      expect(response.statusCode).toEqual(400);
    } catch (err) {
      throw err;
    }
  });
  it("Should get project", async () => {
    try {
      const response = await request(app)
        .get("/api/v1/projects/" + projectid)
        .set("Authorization", "Bearer " + token);

      expect(response.statusCode).toEqual(200);
    } catch (err) {
      throw err;
    }
  });
  it("Should edit project", async () => {
    const newData = {
      title: "Updated title",
      description: "Updated description",
      link: "https://nsengi.onrender.com/api-docs/",
    };
    try {
      const response = await request(app)
        .patch("/api/v1/projects/" + projectid)
        .set("Authorization", "Bearer " + token)
        .send(newData);

      expect(response.statusCode).toEqual(200);
    } catch (err) {
      throw err;
    }
  });
  it("Should delete project", async () => {
    try {
      const response = await request(app)
        .delete("/api/v1/projects/" + projectid)
        .set("Authorization", "Bearer " + token);

      expect(response.statusCode).toEqual(200);
    } catch (err) {
      throw err;
    }
  });
  it("Should throw delete project error no token", async () => {
    try {
      const response = await request(app).delete(
        "/api/v1/projects/" + projectid
      );

      expect(response.statusCode).toEqual(401);
    } catch (err) {
      throw err;
    }
  });
});

afterAll(async () => {
  try {
    await User.findOneAndDelete({
      email: "test1@mail.com",
    });
    await mongoose.disconnect();
  } catch (err) {
    throw err;
  }
}, 
150000);
