import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ordersRouter from "./orders";
import chatRouter from "./chat";
import creditsRouter from "./credits";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/orders", ordersRouter);
router.use("/chat", chatRouter);
router.use("/credits", creditsRouter);

export default router;
