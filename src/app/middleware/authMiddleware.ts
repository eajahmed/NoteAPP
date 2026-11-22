import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import config from "../../config/config.js";
import { ApiError } from "../utils/apiError.js";

// Authenticate Token
export const authenticateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check Authorization Header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Access denied. Token is required"));
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return next(new ApiError(401, "Invalid authorization format"));
  }

  // Check JWT Secret
  const jwtSecret = config.JWT_SECRET;

  if (!jwtSecret) {
    return next(new ApiError(500, "JWT secret is not configured"));
  }

  try {
    // Verify Token
    const decoded = jwt.verify(token, jwtSecret);

    if (typeof decoded === "string" || typeof decoded.userId !== "string") {
      return next(new ApiError(401, "Invalid token payload"));
    }

    // Store User ID
    res.locals.userId = decoded.userId;

    next();
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
};