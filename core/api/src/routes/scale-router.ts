import { Router } from "express";
import { scale } from "../controllers/scale-controller";

const scaleRouter = Router();

scaleRouter.post("/", scale);

export default scaleRouter;
