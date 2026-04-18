import { pathLogger } from "../middleware/logger.js";
import { type Express, json, urlencoded, type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import routes, { excludedPaths } from "./routes.data.js";
import { errorHandler } from "../middleware/errorHandler.js";
import { ResponseHandler } from "../utility/response.handler.js";
import { tokenValidator } from "../middleware/token.validate.js";

export const registerRoutes = (app: Express) => {  
  app.use(
    cors({
      origin: true, // Allow all origins
      credentials: true, // Allow cookies to be sent with requests
    })  
  );
  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.use(pathLogger);
  
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "PDF must be 10MB or less." });
    }
    return next(err);
  });

  app.use(tokenValidator(excludedPaths));

  app.get("/health", (req: Request, res: Response) => {
    res.send(new ResponseHandler("OK"));
  });

  app.get('/', (req: Request, res: Response) => {
    console.log(req.ip,"ip");
    
    res.send('Hello from the server');
  });

  for (let route of routes) {
    app.use(route.path, route.router);
  }

  app.use(errorHandler);
};
