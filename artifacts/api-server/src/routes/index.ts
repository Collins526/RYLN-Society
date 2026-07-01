import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import membersRouter from "./members";
import announcementsRouter from "./announcements";
import activitiesRouter from "./activities";
import galleryRouter from "./gallery";
import contactRouter from "./contact";
import dashboardRouter from "./dashboard";
import leadershipRouter from "./leadership";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(membersRouter);
router.use(announcementsRouter);
router.use(activitiesRouter);
router.use(galleryRouter);
router.use(contactRouter);
router.use(dashboardRouter);
router.use(leadershipRouter);

export default router;
