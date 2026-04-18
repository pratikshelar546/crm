import { Router, type NextFunction, type Request, type Response } from "express";
import { ResponseHandler } from "../../utility/response.handler.js";
import {
  appendNoteFromBody,
  createLead,
  getDashboardMetrics,
  getLeadDetail,
  listLeadsFromQuery,
  softDeleteLeadByParam,
  updateLeadFromBody,
} from "./leads.service.js";

const router = Router();

router.post("/create", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lead = await createLead(req.body, req.user?.userId);
    return res.status(201).send(new ResponseHandler(lead));
  } catch (error) {
    next(error);
  }
});

router.get("/dashboard", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = await getDashboardMetrics();
    return res.send(new ResponseHandler(metrics));
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await listLeadsFromQuery(req.query);
    return res.send(new ResponseHandler(result));
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lead = await getLeadDetail(req.params.id);
    return res.send(new ResponseHandler(lead));
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lead = await updateLeadFromBody(req.params.id, req.body);
    return res.send(new ResponseHandler(lead));
  } catch (error) {
    next(error);
  }
});

router.post("/:id/notes", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lead = await appendNoteFromBody(req.params.id, req.body);
    return res.status(201).send(new ResponseHandler(lead));
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await softDeleteLeadByParam(req.params.id);
    return res.send(new ResponseHandler({ message: "Lead deleted successfully" }));
  } catch (error) {
    next(error);
  }
});

export default router;
