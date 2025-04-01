import mongoose from "mongoose";
import app from "./app";
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || "";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, async () => {
      console.log(`Server running on ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
