import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

interface AuthRequest extends Request {
  userData?: any;
}

const checkAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new Error("Authorization failed");
    }
    const decoded = jwt.verify(token, process.env.JWT_KEY!) as any;
    req.userData = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Authorization failed",
    });
  }
};

export default checkAuth;
