
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import prisma from "../../../config/prisma.js";
import config from "../../../config/config.js";
import { ApiError } from "../../utils/apiError.js";

import type {
  CreateUserInput,
  UpdatePasswordInput,
} from "./user.type.js";

// Register User
export const registerUserService = async (data: CreateUserInput) => {
  // Allow only these fields
  const allowedFields = ["name", "email", "password"];

  const unexpectedFields = Object.keys(data).filter(
    (key) => !allowedFields.includes(key),
  );

  if (unexpectedFields.length > 0) {
    throw new ApiError(400, "Unexpected fields are not allowed");
  }

  const { name, email, password } = data;

  // Required field validation
  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password.trim()
  ) {
    throw new ApiError(400, "Please provide valid name, email, and password");
  }

  // Email validation
  const normalizedEmail = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  // Password Validation
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])[A-Za-z\d\W_]{8,32}$/;

  if (!passwordRegex.test(password)) {
    throw new ApiError(
      400,
      "Password must be 8-32 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    );
  }

  // Check existing user
  const userExists = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (userExists) {
    throw new ApiError(409, "Email already registered");
  }

  // Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create User
  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return {
    _id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    createdAt: newUser.createdAt,
  };
};

// Login User
export const loginUserService = async (data: {
  email: string;
  password: string;
}) => {
  const { email, password } = data;

  // Required field validation
  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    throw new ApiError(400, "Email and password are required");
  }

  // Find User
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Compare Password
  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new ApiError(401, "Invalid email or password");
  }

  // JWT Secret Validation
  if (!config.JWT_SECRET) {
    throw new ApiError(500, "JWT secret is not configured");
  }

  // Generate Token
  const token = jwt.sign(
    { userId: user.id },
    config.JWT_SECRET,
    {
      expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    },
  );

  return {
    user: {
      _id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    token,
  };
};

// Get All Users
export const getUsersService = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  if (users.length === 0) {
    throw new ApiError(404, "No users found");
  }

  return users.map((user) => ({
    _id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  }));
};

// Update Password
export const updatePasswordService = async (
  userId: string,
  data: UpdatePasswordInput,
) => {
  const { oldPassword, newPassword } = data;

  // Required field validation
  if (
    typeof oldPassword !== "string" ||
    !oldPassword ||
    typeof newPassword !== "string" ||
    !newPassword
  ) {
    throw new ApiError(400, "Old password and new password are required");
  }

  // New Password Validation
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])[A-Za-z\d\W_]{8,32}$/;

  if (!passwordRegex.test(newPassword)) {
    throw new ApiError(
      400,
      "New password must be 8-32 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    );
  }

  // Find User
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Verify Old Password
  const isPasswordMatched = await bcrypt.compare(
    oldPassword,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new ApiError(401, "Old password is incorrect");
  }

  // Hash New Password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: "Password updated successfully",
  };
};

// Delete User Account
export const deleteUserService = async (userId: string) => {
  const result = await prisma.user.deleteMany({
    where: { id: userId },
  });

  if (result.count === 0) {
    throw new ApiError(404, "User not found");
  }

  return {
    message: "User account deleted successfully",
  };
};
