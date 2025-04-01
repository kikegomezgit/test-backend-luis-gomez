import Player from "../models/player.model";
import LineUp from "../models/lineUp.model";
import Action, { IAction } from "../models/action.model";
import Joi from "joi";
import { Types } from "mongoose";
import redis from "../utils/redisClient";
const REDIS_ACTION_PREFIX = "action:";
const TTL_SECONDS = 60 * 60 * 24 * 15;

const actionSchema = Joi.object({
  type: Joi.string()
    .valid("gol", "autogol", "asistencia", "amarilla", "roja")
    .required(),
  minute: Joi.number().integer().min(0).required(),
  player: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required(),
  lineUp: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required(),
});

interface ActionFilters {
  type?: string;
  playerId?: string;
  lineUp?: string;
  page: number;
  limit: number;
}

export const create = async (data: Partial<IAction>) => {
  try {
    const validated = await actionSchema.validateAsync(data);
    const player = await Player.findById(validated.player);
    if (!player) {
      throw new Error("Player not found");
    }
    const lineUp = await LineUp.findById(validated.lineUp);
    if (!lineUp) {
      throw new Error("LineUp not found");
    }
    const created = await Action.create(validated);
    if (created && created._id) {
      await redis.setEx(
        `${REDIS_ACTION_PREFIX}${created._id}`,
        TTL_SECONDS,
        JSON.stringify(created)
      );
      return { success: true };
    }
  } catch (err: any) {
    if (err.isJoi) {
      const validationError = new Error(err.message);
      (validationError as any).status = 400;
      throw validationError;
    }
    throw err;
  }
};
export const count = async (playerId?: string, lineUpId?: string) => {
  const filter: any = {};
  if (playerId) filter.player = playerId;
  if (lineUpId) filter.lineUp = lineUpId;

  const result = await Action.aggregate([
    { $match: filter },
    { $group: { _id: "$type", total: { $sum: 1 } } },
  ]);

  return result.reduce((acc, curr) => {
    acc[curr._id] = curr.total;
    return acc;
  }, {});
};

export const remove = async (id: string) => {
  const removed = await Action.findByIdAndDelete(id);
  if (removed && removed._id) {
    await redis.del(`${REDIS_ACTION_PREFIX}${removed._id}`);
    return { success: true };
  }
};

interface ActionFilters {
  type?: string;
  playerId?: string;
  lineUp?: string;
  page: number;
  limit: number;
}

export const getAll = async ({
  type,
  playerId,
  lineUp,
  page,
  limit,
}: ActionFilters) => {
  const filter: any = {};

  if (type) filter.type = type;
  if (playerId) filter.player = new Types.ObjectId(playerId);
  if (lineUp) filter.lineUp = new Types.ObjectId(lineUp);

  const [actions, total] = await Promise.all([
    Action.find(filter)
      .populate("player")
      .skip((page - 1) * limit)
      .limit(limit),
    Action.countDocuments(filter),
  ]);

  return {
    actions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
