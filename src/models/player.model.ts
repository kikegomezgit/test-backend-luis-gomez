import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPlayer extends Document {
  playerId: Types.ObjectId;
  nickname: string;
  backNumber: number;
  position: "portero" | "defensa" | "mediocentro" | "delantero";
}

const playerSchema = new Schema<IPlayer>({
  nickname: { type: String, required: true },
  backNumber: { type: Number, required: true },
  position: {
    type: String,
    enum: ["portero", "defensa", "mediocentro", "delantero"],
    required: true,
  },
});
playerSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

playerSchema.set("toObject", {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});
export default mongoose.model<IPlayer>("Player", playerSchema);
