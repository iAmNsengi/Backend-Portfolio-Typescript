import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user";
import signUpUser from "../controllers/user";
import Joi from "joi";

dotenv.config();

const router = express.Router();

// Joi schema for signup request body validation
const signUpSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

/**
 * @swagger
 * /api/v1/user/signup:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       '200':
 *         description: User registered successfully
 *       '400':
 *         description: Invalid request body
 */

router.post("/signup", (req: Request, res: Response, next: NextFunction) => {
  // Validate request body against Joi schema
  const { error, value } = signUpSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  signUpUser(req, res, next);
});

/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     summary: Log in as an existing user
 *     description: Log in with email and password to obtain a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       '200':
 *         description: Authentication successful
 *       '401':
 *         description: Unauthorized - Invalid credentials
 */
router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .exec()
    .then((user: any) => {
      if (!user) {
        return res.status(401).json({
          message: "Authentication failed",
        });
      }

      bcrypt.compare(password, user.password, (err: any, result: any) => {
        if (err || !result) {
          return res.status(401).json({
            message: "Authentication failed",
          });
        }

        const token = jwt.sign(
          {
            email: user.email,
            userId: user._id,
          },
          process.env.JWT_KEY!,
          {
            expiresIn: "1h",
          }
        );

        res.status(200).json({
          message: "Auth successful",
          token: token,
          _id: user._id,
        });
      });
    })
    .catch((err: any) => {
      res.status(500).json({ error: err });
    });
});

/**
 * @swagger
 * /api/v1/user/{userId}:
 *   delete:
 *     summary: Delete a user account
 *     description: Delete a user account by their ID.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user account to delete
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: User account deleted successfully
 *       '404':
 *         description: User account not found
 */
router.delete("/:userId", (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.userId;
  User.deleteOne({ _id: id })
    .exec()
    .then((result: any) => {
      res.status(200).json({
        message: "User account deleted Successfully",
      });
    })
    .catch((err: any) => {
      res.status(500).json({ error: err });
    });
});

export default router;
