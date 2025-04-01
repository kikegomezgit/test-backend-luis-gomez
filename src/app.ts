import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import playerRoutes from "./routes/player.routes";
import lineUpRoutes from "./routes/lineUp.routes";
import actionRoutes from "./routes/action.routes";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/players", playerRoutes);
app.use("/api/lineUps", lineUpRoutes);
app.use("/api/actions", actionRoutes);

app.use(errorHandler);

export default app;
