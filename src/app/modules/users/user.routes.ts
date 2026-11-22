import { Router } from "express";
import {
  registerUser,
  loginUser,
  getUsers,
  updatePassword,
  deleteUser,
} from "./user.controllers.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = Router();

// Public Routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/").get(getUsers);

// Protected Routes
router.route("/password").patch(authenticateToken, updatePassword);
router.route("/").delete(authenticateToken, deleteUser);

export const userRoutes = router;