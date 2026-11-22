import { ObjectId } from "mongodb";

export interface UserDocument {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export interface UpdatePasswordInput {
  oldPassword: string;
  newPassword: string;
}