import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const app = express();

import blogRoutes from "./routes/blogs";
import messageRoutes from "./routes/messages";
import userRoutes from "./routes/user";
import projectRoutes from "./routes/projects";

mongoose.connect(process.env.DATABASE_URL!);

mongoose.Promise = global.Promise;

app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/projects", projectRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
  const error: any = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

export default app;
