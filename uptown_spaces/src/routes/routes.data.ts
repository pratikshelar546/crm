import { Route } from "./routes.types.js";
import Routers from "../module/routes.js";
import { ExcludedPath } from "../middleware/token.validate.js";

const routes = [
  new Route("/leads", Routers.leadsRoutes),
  new Route("/user", Routers.userRoutes),
];

export default routes;

export const excludedPaths = [
  new ExcludedPath("/health", "GET"),
  new ExcludedPath("/user/signup", "POST"),
  new ExcludedPath("/user/login", "POST"),
];
