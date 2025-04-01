import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAction extends Document {
  type: "gol" | "autogol" | "asistencia" | "amarilla" | "roja";
  minute: number;
  player: Types.ObjectId;
  lineUp?: Types.ObjectId;
}

const actionSchema = new Schema<IAction>({
  type: {
    type: String,
    enum: ["gol", "autogol", "asistencia", "amarilla", "roja"],
    required: true,
  },
  minute: { type: Number, required: true },
  player: { type: Schema.Types.ObjectId, ref: "Player", required: true },
  lineUp: { type: Schema.Types.ObjectId, ref: "LineUp", required: true },
});

actionSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

actionSchema.set("toObject", {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});
export default mongoose.model<IAction>("Action", actionSchema);
