import { Router } from "express";
import * as lineUpController from "../controllers/lineUp.controller";
import { validateMongoId } from "../middlewares/validateMongoId";

const router = Router();

router.post("/", lineUpController.upsert);
router.get("/:id", validateMongoId, lineUpController.getLineUp);
router.delete("/:id", validateMongoId, lineUpController.deleteOne);
export default router;
