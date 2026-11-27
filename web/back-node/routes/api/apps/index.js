import { Router } from "express";
import detailsRouter from "./details.js";

const router = Router();

router.use("/details", detailsRouter);

export default router;
