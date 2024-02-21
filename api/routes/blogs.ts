import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import mongoose from "mongoose";
import checkAuth from "../middleware/check-auth";
import Blog from "../models/blog";
import Joi from "joi";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req: any, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

// Define Joi schema for request body validation
const blogSchema = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().required(),
  content: Joi.string().required(),
});

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  Blog.find()
    .select("blogImage author title content _id")
    .exec()
    .then((docs: any) => {
      const response = {
        count: docs.length,
        blogs: docs.map((doc: any) => {
          return {
            blogImage: doc.blogImage,
            title: doc.title,
            author: doc.author,
            content: doc.content,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://nsengi.onrender.com/api/v1/blogs/" + doc._id,
              imageUrl:
                "http://nsengi.onrender.com/api/v1/" + doc.blogImage,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err: any) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.post(
  "/",
  checkAuth,
  upload.single("blogImage"),
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is missing!" });
    }

    // Validate request body against Joi schema
    const { error, value } = blogSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const blog = new Blog({
      _id: new mongoose.Types.ObjectId(),
      title: value.title,
      author: value.author,
      content: value.content,
      blogImage: req.file.path,
    });
    blog
      .save()
      .then((result: any) => {
        console.log(result);
        res.status(201).json({
          message: "Blog Post Created Successfully!",
          createdBlog: {
            _id: result._id,
            title: result.title,
            author: result.author,
            content: result.content,
            request: {
              type: "GET",
              url: "http://nsengi.onrender.com/api/v1/blogs/" + result._id,
            },
          },
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
        console.log(err);
      });
  }
);

router.get("/:blogId", (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.blogId;
  Blog.findById(id)
    .exec()
    .then((doc) => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json(doc);
      } else {
        res
          .status(404)
          .json({ message: "No entry with the given ID was found" });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

router.patch(
  "/:blogId",
  checkAuth,
  (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.blogId;

    // Validate request body against Joi schema
    const { error, value } = blogSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    Blog.findOneAndUpdate({ _id: id }, value)
      .exec()
      .then((result) => {
        res.status(200).json({
          message: "Item updated successfully",
          request: {
            method: "GET",
            url: "http://nsengi.onrender.com/api/v1/blogs/" + id,
          },
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  }
);

router.delete(
  "/:blogId",
  checkAuth,
  (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.blogId;
    Blog.deleteOne({ _id: id })
      .exec()
      .then((result) => {
        res.status(200).json({
          message: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  }
);

export default router;
