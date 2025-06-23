import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const JWT_SECRET = process.env.JWT_SECRET;
export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      const err = new Error("Unauthorized: No token");
      err.statusCode = 401;
      return next(err);
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      const err = new Error("Unauthorized: Invalid user");
      err.statusCode = 401;
      return next(err);
    }

    req.user = user;
    next();
  } catch (error) {
    const err = new Error("Token is invalid or expired");
    err.statusCode = 403;
    return next(err);
  }
};


export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const err = new Error(
        `Access denied: Only [${roles.join(", ")}] allowed`
      );
      err.statusCode = 403;
      return next(err);
    }
    next();
  };
};

