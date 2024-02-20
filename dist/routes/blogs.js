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
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
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
                        url: "http://nsengi-api.onrender.com/api/v1/blogs/" + doc._id,
                        imageUrl: "http://nsengi-api.onrender.com/api/v1/" + doc.blogImage,
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
router.post("/", check_auth_1.default, upload.single("blogImage"), (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: "Image file is missing!" });
    }
    const blog = new blog_1.default({
        _id: new mongoose_1.default.Types.ObjectId(),
        title: req.body.title,
        author: req.body.author,
        content: req.body.content,
        blogImage: req.file.path,
    });
    blog
        .save()
        .then((result) => {
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
                    url: "http://nsengi-api.onrender.com/api/v1/blogs/" + result._id,
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
});
router.get("/:blogId", (req, res, next) => {
    const id = req.params.blogId;
    blog_1.default.findById(id)
        .exec()
        .then((doc) => {
        console.log("From database", doc);
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
router.patch("/:blogId", check_auth_1.default, (req, res, next) => {
    const id = req.params.blogId;
    blog_1.default.findOneAndUpdate({ _id: id }, req.body)
        .exec()
        .then((result) => {
        res.status(200).json({
            message: "Item updated successfully",
            request: {
                method: "GET",
                url: "http://nsengi-api.onrender.com/api/v1/blogs/" + id,
            },
        });
    })
        .catch((err) => {
        res.status(500).json({
            error: err,
        });
    });
});
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
exports.default = router;
