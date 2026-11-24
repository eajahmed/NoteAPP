export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export interface UpdatePasswordInput {
  oldPassword: string;
  newPassword: string;
}