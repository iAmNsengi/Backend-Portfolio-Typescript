import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import multer from "multer";
import Project from "../models/project";
import checkAuth from "../middleware/check-auth";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
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
    fileSize: 1024 * 1024 * 5, // 5 MB
  },
  fileFilter: fileFilter,
});

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  Project.find()
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

router.post(
  "/",
  checkAuth,
  upload.single("image"),
  (req: Request, res: Response, next: NextFunction) => {
    const { title, description, link } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "Image file is missing!" });
    }

    const project = new Project({
      _id: new mongoose.Types.ObjectId(),
      title: title,
      description: description,
      image: req.file.path,
      link: link,
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
              link: `http://nsengi-api.onrender.com/api/v1/${result._id}`,
            },
          },
        });
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  }
);

router.get("/:projectId", (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.projectId;
  Project.findById(id)
    .exec()
    .then((doc) => {
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
  "/:projectId",
  checkAuth,
  (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.projectId;
    Project.findOneAndUpdate({ _id: id }, req.body)
      .exec()
      .then((result) => {
        res.status(200).json({
          message: "Item updated successfully",
          request: {
            method: "GET",
            url: `http://nsengi-api.onrender.com/api/v1/${id}`,
          },
        });
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  }
);

router.delete(
  "/:projectId",
  checkAuth,
  (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.projectId;
    Project.deleteOne({ _id: id })
      .exec()
      .then((result) => {
        res.status(200).json({ message: "Item removed successfully" });
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  }
);

export default router;
