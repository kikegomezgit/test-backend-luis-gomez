import { Router } from "express";
import * as playerController from "../controllers/player.controller";
import { validateMongoId } from "../middlewares/validateMongoId";

const router = Router();

router.get("/", playerController.getAll);
router.post("/", playerController.create);
router.post("/bulk", playerController.insertManyPlayers);
router.put("/:id", playerController.updatePlayer);
router.delete("/:id", validateMongoId, playerController.deletePlayer);
export default router;
