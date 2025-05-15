import { Router } from "express";
import scaleRouter from "./scale-router";

const router = Router();

router.use("/scale", scaleRouter);

export default router;
