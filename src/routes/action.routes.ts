import { Router } from "express";
import * as actionController from "../controllers/action.controller";
import { validateMongoId } from "../middlewares/validateMongoId";

const router = Router();
router.post("/", actionController.create);
router.get("/stats", actionController.getStats);
router.get("/", actionController.getAllActions);
router.delete("/:id", validateMongoId, actionController.deleteOne);
export default router;
