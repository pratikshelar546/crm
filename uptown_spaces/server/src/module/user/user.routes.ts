import { Router, type NextFunction, type Request, type Response } from "express";
import { loginUser, signupUser } from "./user.service.js";
import { loginSuccessResponse, signupSuccessResponse } from "./user.response.js";

const router = Router();

router.post("/signup", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next({ statusCode: 400, message: "name, email and password are required" });
    }

    const user = await signupUser({ name, email, password });
    return res.status(201).send(signupSuccessResponse(user));
  } catch (error) {
    return next(error);
  }
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next({ statusCode: 400, message: "email and password are required" });
    }

    const data = await loginUser({ email, password });
    return res.status(200).send(loginSuccessResponse(data));
  } catch (error) {
    return next(error);
  }
});

export default router;
