import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import mongoose from "mongoose";
import checkAuth from "../middleware/check-auth";
import Blog from "../models/blog";
import Joi from "joi";
import Comment from "../models/comment";
import { AuthRequest } from "../middleware/check-auth";

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

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: API endpoints for managing blogs
 */

/**
 * @swagger
 * /api/v1/blogs:
 *   get:
 *     summary: Get all blogs
 *     description: Retrieve a list of all blogs.
 *     responses:
 *       '200':
 *         description: A list of blogs
 */

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
              imageUrl: "http://nsengi.onrender.com/api/v1/" + doc.blogImage,
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

/**
 * @swagger
 * /api/v1/blogs:
 *   post:
 *     summary: Create a new blog post
 *     description: Create a new blog post with title, author, content, and an optional image.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               content:
 *                 type: string
 *               blogImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '201':
 *         description: Blog post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 */

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
/**
 * @swagger
 * /api/v1/blogs/{blogId}:
 *   get:
 *     summary: Retrieve a blog by ID
 *     description: Retrieve details of a specific blog post.
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         description: ID of the blog post to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Details of the blog post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
 *       '404':
 *         description: Blog post not found
 */
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

/**
 * @swagger
 * /api/v1/blogs/{blogId}:
 *   patch:
 *     summary: Update a blog
 *     description: Update an existing blog post with the given ID.
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         description: ID of the blog post to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Blog'
 *     responses:
 *       '200':
 *         description: Blog updated successfully
 *       '404':
 *         description: Blog post not found
 */

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

/**
 * @swagger
 * /api/v1/blogs/{blogId}:
 *   delete:
 *     summary: Delete a blog
 *     description: Delete a blog post with the given ID.
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         description: ID of the blog post to delete
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Blog deleted successfully
 *       '404':
 *         description: Blog post not found
 */

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

//  Dealing with comments starts here
// ------------------------------

/**
 * @swagger
 * /api/v1/blogs/{postId}/comments:
 *   get:
 *     summary: Retrieve comments for a blog post
 *     description: Retrieve all comments associated with a specific blog post.
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: ID of the blog post
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A list of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       '404':
 *         description: Blog post not found
 */
router.get(
  "/:postId/comments",
  checkAuth,
  (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.postId;
    Blog.findById(id)
      .exec()
      .then((doc) => {
        if (doc) {
          Comment.find({ $or: [{ postId: id }] })
            .exec()
            .then((docs) => {
              const response = {
                count: docs.length,
                blog: doc.title,
                comments: docs.map((result: any) => {
                  return {
                    comment_by: result.comment_by,
                    comment_content: result.comment_content,
                    _id: doc._id,
                  };
                }),
              };
              res.status(200).json(response);
            })
            .catch((err) => {
              res.status(500).json(err);
            });
        } else {
          res
            .status(404)
            .json({ message: "No entry with the given ID was found" });
        }
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  }
);

// defining joi schema for request body validation
const commentSchema = Joi.object({
  comment_content: Joi.string().min(2).required(),
});

/**
 * @swagger
 * /api/v1/blogs/{postId}/comments:
 *   post:
 *     summary: Add a comment to a blog post
 *     description: Add a new comment to the specified blog post.
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: ID of the blog post
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       '201':
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       '404':
 *         description: Blog post not found
 */
router.post(
  "/:postId/comments",
  checkAuth,
  (req: Request, res: Response, next: NextFunction) => {
    // Validate request body against Joi schema
    const { error, value } = commentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const postId = req.params.postId;
    const authReq = req as AuthRequest;

    // access the user ID from authReq.userData
    if (authReq.userData) {
      const userId = authReq.userData.userId;

      const comment = new Comment({
        _id: new mongoose.Types.ObjectId(),
        postId: postId,
        comment_by: userId,
        comment_content: value.comment_content,
      });
      comment
        .save()
        .then((result: any) => {
          res.status(201).json({
            message: "Comment added Successfully!",
            createdComment: {
              _id: result._id,
              commented_by: result.comment_by,
              post_id: result.post_id,
              content: result.comment_content,
            },
          });
        })
        .catch((err) => {
          res.status(500).json({
            error: err,
          });
        });
    } else {
      res.status(401).json({
        message: "User data not found",
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/blogs/{postId}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment from a blog post
 *     description: Delete a comment from the specified blog post.
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: ID of the blog post
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: ID of the comment
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Comment deleted successfully
 *       '404':
 *         description: Comment or blog post not found
 */
router.delete(
  "/:postId/comments/:commentId",
  checkAuth,
  (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    Comment.findOne({ $or: [{ postId: postId } && { _id: commentId }] })
      .exec()
      .then(() => {
        Comment.deleteOne({ _id: commentId })
          .exec()
          .then((result: any) => {
            res.status(200).json({ result });
          })
          .catch();
      })
      .catch((err) => {
        res.status(404).json(err);
      });
  }
);

export default router;
