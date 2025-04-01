import mongoose, { Schema, Document, Types } from "mongoose";

interface PlayerLineUp {
  playerId: Types.ObjectId;
}

export interface ILineUp extends Document {
  formation: string;
  type: "local" | "visitante";
  players: PlayerLineUp[];
}

const lineUpSchema = new Schema<ILineUp>({
  formation: {
    type: String,
    enum: ["4-4-2", "4-3-3", "3-4-3"],
    required: true,
  },
  type: { type: String, enum: ["local", "visitante"], required: true },
  players: [{ type: Schema.Types.ObjectId, ref: "Player", required: true }],
});

lineUpSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

lineUpSchema.set("toObject", {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model<ILineUp>("LineUp", lineUpSchema);
