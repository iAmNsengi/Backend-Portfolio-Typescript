"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const mongoose_1 = __importDefault(require("mongoose"));
const check_auth_1 = __importDefault(require("../middleware/check-auth"));
const blog_1 = __importDefault(require("../models/blog"));
const joi_1 = __importDefault(require("joi"));
const comment_1 = __importDefault(require("../models/comment"));
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
    fileFilter: fileFilter,
});
// Define Joi schema for request body validation
const blogSchema = joi_1.default.object({
    title: joi_1.default.string().required(),
    author: joi_1.default.string().required(),
    content: joi_1.default.string().required(),
});
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     JWTAuth:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 *       description: Enter JWT token in the format "Bearer <token>"
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
router.get("/", (req, res, next) => {
    blog_1.default.find()
        .select("blogImage author title content _id")
        .exec()
        .then((docs) => {
        const response = {
            count: docs.length,
            blogs: docs.map((doc) => {
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
        .catch((err) => {
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
 *     security:
 *       - JWTAuth: []
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
 */
router.post("/", check_auth_1.default, upload.single("blogImage"), (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: "Image file is missing!" });
    }
    // Validate request body against Joi schema
    const { error, value } = blogSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const blog = new blog_1.default({
        _id: new mongoose_1.default.Types.ObjectId(),
        title: value.title,
        author: value.author,
        content: value.content,
        blogImage: req.file.path,
    });
    blog
        .save()
        .then((result) => {
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
    });
});
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
router.get("/:blogId", (req, res, next) => {
    const id = req.params.blogId;
    blog_1.default.findById(id)
        .exec()
        .then((doc) => {
        if (doc) {
            res.status(200).json(doc);
        }
        else {
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
router.patch("/:blogId", check_auth_1.default, (req, res, next) => {
    const id = req.params.blogId;
    // Validate request body against Joi schema
    const { error, value } = blogSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    blog_1.default.findOneAndUpdate({ _id: id }, value)
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
});
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
router.delete("/:blogId", check_auth_1.default, (req, res, next) => {
    const id = req.params.blogId;
    blog_1.default.deleteOne({ _id: id })
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
});
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
router.get("/:postId/comments", check_auth_1.default, (req, res, next) => {
    const id = req.params.postId;
    blog_1.default.findById(id)
        .exec()
        .then((doc) => {
        if (doc) {
            comment_1.default.find({ $or: [{ postId: id }] })
                .exec()
                .then((docs) => {
                const response = {
                    count: docs.length,
                    blog: doc.title,
                    comments: docs.map((result) => {
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
        }
        else {
            res
                .status(404)
                .json({ message: "No entry with the given ID was found" });
        }
    })
        .catch((err) => {
        res.status(500).json({ error: err });
    });
});
// defining joi schema for request body validation
const commentSchema = joi_1.default.object({
    comment_content: joi_1.default.string().min(2).required(),
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
router.post("/:postId/comments", check_auth_1.default, (req, res, next) => {
    // Validate request body against Joi schema
    const { error, value } = commentSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const postId = req.params.postId;
    const authReq = req;
    // access the user ID from authReq.userData
    if (authReq.userData) {
        const userId = authReq.userData.userId;
        const comment = new comment_1.default({
            _id: new mongoose_1.default.Types.ObjectId(),
            postId: postId,
            comment_by: userId,
            comment_content: value.comment_content,
        });
        comment
            .save()
            .then((result) => {
            res.status(201).json({
                message: "Comment added Successfully!",
                createdComment: {
                    _id: result._id,
                    comment_by: result.comment_by,
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
    }
    else {
        res.status(401).json({
            message: "User data not found",
        });
    }
});
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
router.delete("/:postId/comments/:commentId", check_auth_1.default, (req, res, next) => {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    comment_1.default.findOne({ $or: [{ postId: postId } && { _id: commentId }] })
        .exec()
        .then(() => {
        comment_1.default.deleteOne({ _id: commentId })
            .exec()
            .then((result) => {
            res.status(200).json({ result });
        })
            .catch();
    })
        .catch((err) => {
        res.status(404).json(err);
    });
});
exports.default = router;
