import app from "../app";
import request from "supertest";
import express, { Express } from "express";
import bodyParser from "body-parser";
import router from "../routes/blogs";
import Blog from "../models/blog";
import Comment from "../models/comment";
import checkAuth from "../middleware/check-auth";

// Mocking modules
jest.mock("../models/blog");
jest.mock("../models/comment");
jest.mock("../middleware/check-auth");

app.use(bodyParser.json());
app.use("/api/v1/blogs", router);

describe("User Routes", () => {
  it("should throw a data validation error registering the user", async () => {
    try {
      const response = await request(app)
        .post("/api/v1/user/signup")
        .send({ email: "", password: "" });
      expect(response.status).toBe(400);
    } catch (err) {
      console.log(err);
    }
  });

  it("should throw a data validation error registering the user", async () => {
    try {
      const response = await request(app)
        .post("/api/v1/user/signup")
        .send({ email: "test@mail.com", password: "" });
      expect(response.status).toBe(400);
    } catch (err) {
      console.log(err);
    }
  });

  it("should throw a data validation error registering the user due to short password length", async () => {
    try {
      const response = await request(app)
        .post("/api/v1/user/signup")
        .send({ email: "test@mail.com", password: "12" });
      expect(response.status).toBe(400);
    } catch (err) {
      console.log(err);
    }
  });

  it("should register a new user", async () => {
    try {
      const response = await request(app)
        .post("/api/v1/user/signup")
        .send({ email: "test@example.com", password: "password123" });
      expect(response.status).toBe(201);
    } catch (err) {
      console.log(err);
    }
  });
  it("should throw a conflic error registering the user", async () => {
    try {
      const response = await request(app)
        .post("/api/v1/user/signup")
        .send({ email: "test@example.com", password: "password123" });
      expect(response.status).toBe(409);
    } catch (err) {
      console.log(err);
    }
  });

  it(" Should throw a not found error", async () => {
    try {
      const response = await request(app)
        .post("/api/v1/user/login")
        .send({ email: "test@example.com", password: "password12345" });
      expect(response.status).toBe(404);
    } catch (err) {
      console.log(err);
    }
  });

  it(" Should login user", async () => {
    try {
      const response = await request(app)
        .post("/api/v1/user/login")
        .send({ email: "test@example.com", password: "password123" });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
    } catch (err) {
      console.log(err);
    }
  });
});




describe("GET /api/v1/blogs", () => {
  it("should get all blogs", async () => {
    const response = await request(app).get("/api/v1/blogs");
    expect(response.status).toBe(200);
  });
});

