import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/user";

const signUpUser = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .exec()
    .then((user: any) => {
      if (user) {
        return res.status(409).json({
          message: "Email Already exists",
        });
      } else {
        bcrypt.hash(password, 10, (err: any, hash: string) => {
          if (err) {
            return res.status(500).json({ error: err });
          } else {
            const newUser = new User({
              _id: new mongoose.Types.ObjectId(),
              email: email,
              password: hash,
            });
            newUser
              .save()
              .then((result: any) => {
                console.log(result);
                res.status(201).json({
                  message: "User created!",
                });
              })
              .catch((err: any) => {
                res.status(500).json({
                  error: err,
                });
              });
          }
        });
      }
    })
    .catch((err: any) => {
      res.status(500).json({
        error: err,
      });
    });
};

export default signUpUser;
