import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Users } from "./user.schema.js";

type SignupInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-key";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? "1d");

const signAccessToken = (payload: { userId: string; email: string }) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

export const signupUser = async ({ name, email, password }: SignupInput) => {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await Users.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw { statusCode: 409, message: "Email already registered" };
  }

  const user = await Users.create({
    name: name.trim(),
    email: normalizedEmail,
    password: await bcrypt.hash(password, 10),
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
  };
};

export const loginUser = async ({ email, password }: LoginInput) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await Users.findOne({ email: normalizedEmail });

  if (!user) {
    throw { statusCode: 401, message: "Invalid email or password" };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw { statusCode: 401, message: "Invalid email or password" };
  }

  return {
    token: signAccessToken({
      userId: String(user._id),
      email: user.email,
    }),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  };
};
