import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  registerUserService,
  loginUserService,
  getUsersService,
  updatePasswordService,
  deleteUserService,
} from "./user.service.js";

import type { CreateUserInput } from "./user.type.js";

// Register User
export const registerUser = asyncHandler(async (req, res) => {
  const user = await registerUserService(req.body as CreateUserInput);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: user,
  });
});

// Login User
export const loginUser = asyncHandler(async (req, res) => {
  const result = await loginUserService(req.body);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
});

// Get All Users
export const getUsers = asyncHandler(async (req, res) => {
  const users = await getUsersService();

  res.status(200).json({
    success: true,
    data: users,
  });
});

// Update Password
export const updatePassword = asyncHandler(async (req, res) => {
  const userId = res.locals.userId;

  await updatePasswordService(userId, req.body);

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

// Delete User Account
export const deleteUser = asyncHandler(async (req, res) => {
  const userId = res.locals.userId;

  await deleteUserService(userId);

  res.status(200).json({
    success: true,
    message: "Account deleted successfully",
  });
});