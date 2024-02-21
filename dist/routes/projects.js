"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const multer_1 = __importDefault(require("multer"));
const project_1 = __importDefault(require("../models/project"));
const check_auth_1 = __importDefault(require("../middleware/check-auth"));
const joi_1 = __importDefault(require("joi"));
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
        fileSize: 1024 * 1024 * 5, // 5 MB
    },
    fileFilter: fileFilter,
});
// Define Joi schema for request body validation
const projectSchema = joi_1.default.object({
    title: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    link: joi_1.default.string().uri().required(),
});
router.get("/", (req, res, next) => {
    project_1.default.find()
        .select("image title description link _id")
        .exec()
        .then((docs) => {
        const response = {
            count: docs.length,
            projects: docs.map((doc) => ({
                image: doc.image,
                title: doc.title,
                description: doc.description,
                link: doc.link,
                _id: doc._id,
                request: {
                    type: "GET",
                    url: `http://nsengi-api.onrender.com/api/v1/projects/${doc._id}`,
                    imageUrl: `http://nsengi-api.onrender.com/api/v1/${doc.image}`,
                },
            })),
        };
        res.status(200).json(response);
    })
        .catch((err) => {
        res.status(500).json({ error: err });
    });
});
router.post("/", check_auth_1.default, upload.single("image"), (req, res, next) => {
    // Validate request body against Joi schema
    const { error, value } = projectSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    if (!req.file) {
        return res.status(400).json({ message: "Image file is missing!" });
    }
    const project = new project_1.default({
        _id: new mongoose_1.default.Types.ObjectId(),
        title: value.title,
        description: value.description,
        image: req.file.path,
        link: value.link,
    });
    project
        .save()
        .then((result) => {
        res.status(201).json({
            message: "Project Created Successfully!",
            createdProject: {
                _id: result._id,
                title: result.title,
                description: result.description,
                image: result.image,
                link: result.link,
                request: {
                    type: "GET",
                    link: `http://nsengi-api.onrender.com/api/v1/projects/${result._id}`,
                },
            },
        });
    })
        .catch((err) => {
        res.status(500).json({ error: err });
    });
});
router.get("/:projectId", (req, res, next) => {
    const id = req.params.projectId;
    project_1.default.findById(id)
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
router.patch("/:projectId", check_auth_1.default, (req, res, next) => {
    const id = req.params.projectId;
    // Validate request body against Joi schema
    const { error, value } = projectSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    project_1.default.findOneAndUpdate({ _id: id }, value)
        .exec()
        .then((result) => {
        res.status(200).json({
            message: "Item updated successfully",
            request: {
                method: "GET",
                url: `http://nsengi-api.onrender.com/api/v1/projects/${id}`,
            },
        });
    })
        .catch((err) => {
        res.status(500).json({ error: err });
    });
});
router.delete("/:projectId", check_auth_1.default, (req, res, next) => {
    const id = req.params.projectId;
    project_1.default.deleteOne({ _id: id })
        .exec()
        .then((result) => {
        res.status(200).json({ message: "Item removed successfully" });
    })
        .catch((err) => {
        res.status(500).json({ error: err });
    });
});
exports.default = router;
