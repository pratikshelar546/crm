import { ResponseHandler } from "../../utility/response.handler.js";

export const signupSuccessResponse = (user: {
  id: unknown;
  name: string;
  email: string;
}) => new ResponseHandler({ message: "Signup successful", user });

export const loginSuccessResponse = (data: {
  token: string;
  user: { id: unknown; name: string; email: string };
}) => new ResponseHandler({ message: "Login successful", ...data });
