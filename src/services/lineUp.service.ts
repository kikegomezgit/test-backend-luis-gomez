import Player, { IPlayer } from "../models/player.model";
import LineUp, { ILineUp } from "../models/lineUp.model";
import Action from "../models/action.model";
import { Types } from "mongoose";
import Joi from "joi";
import redis from "../utils/redisClient";
const REDIS_LINEUP_PREFIX = "lineup:";
const TTL_SECONDS = 60 * 60 * 24 * 15;

const lineUpSchema = Joi.object({
  formation: Joi.string().valid("4-4-2", "4-3-3", "3-4-3").required(),
  type: Joi.string().valid("local", "visitante").required(),
  players: Joi.array()
    .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
    .length(11)
    .required(),
});

const FORMATION_MAP: Record<string, Record<string, number>> = {
  "4-4-2": { portero: 1, defensa: 4, mediocentro: 4, delantero: 2 },
  "4-3-3": { portero: 1, defensa: 4, mediocentro: 3, delantero: 3 },
  "3-4-3": { portero: 1, defensa: 3, mediocentro: 4, delantero: 3 },
};

export const upsert = async (data: Partial<ILineUp>) => {
  try {
    const parsed = await lineUpSchema.validateAsync(data);
    const playerIds = parsed.players?.map((id: any) => new Types.ObjectId(id));
    const playerDocs = await Player.find({ _id: { $in: playerIds } });
    const grouped: Record<string, Types.ObjectId[]> = {
      portero: [],
      defensa: [],
      mediocentro: [],
      delantero: [],
    };

    for (const player of playerDocs) {
      grouped[player.position].push(player._id);
    }

    const expected = FORMATION_MAP[parsed.formation];
    if (!expected) {
      throw new Error(`Unsupported formation: ${parsed.formation}`);
    }

    const selectedPlayers: Types.ObjectId[] = [];
    for (const position in expected) {
      const needed = expected[position];
      const available = grouped[position] || [];

      if (available.length < needed) {
        throw new Error(
          `Not enough players for position '${position}': need ${needed}, got ${available.length}`
        );
      }

      selectedPlayers.push(...available.slice(0, needed));
    }

    if (selectedPlayers.length !== 11) {
      throw new Error(
        `Total selected players must be 11, got ${selectedPlayers.length}`
      );
    }
    const update = {
      formation: parsed.formation,
      players: selectedPlayers,
    };
    const result = await LineUp.findOneAndUpdate(
      { type: parsed.type },
      update,
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    const populated = await LineUp.findById(result._id).populate("players");
    await redis.setEx(
      `${REDIS_LINEUP_PREFIX}${result._id}`,
      TTL_SECONDS,
      JSON.stringify(populated)
    );
    return result;
  } catch (err: any) {
    if (err.isJoi) {
      const validationError = new Error(err.message);
      (validationError as any).status = 400;
      throw validationError;
    }
    throw err;
  }
};

export const remove = async (id: string) => {
  const deleted = await LineUp.findByIdAndDelete(id);
  if (deleted) {
    await redis.del(`${REDIS_LINEUP_PREFIX}${id}`);
  }
  return deleted;
};

export const getById = async (
  id: string,
  includeActions = false,
  includePlayers = false
) => {
  const redisKey = `lineup:${id}`;
  const cached = await redis.get(redisKey);
  let data: any;
  if (cached) {
    await redis.expire(`lineup:${id}`, TTL_SECONDS);
    data = JSON.parse(cached);
  } else {
    const lineup = await LineUp.findById(id).populate(
      includePlayers ? "players" : ""
    );
    if (!lineup) throw new Error("LineUp not found");
    data = lineup.toObject();
    if (!includePlayers) delete data.players;
    if (includePlayers) {
      await redis.setEx(redisKey, TTL_SECONDS, JSON.stringify(data));
    }
  }
  if (includeActions) {
    if (data.players) {
      const playerIds = data.players.map((p: any) => p._id.toString());
      const actions = await Action.find({
        lineUp: id,
        player: { $in: playerIds },
      });

      const actionsByPlayer: Record<string, any[]> = {};
      for (const action of actions) {
        const pid = action.player.toString();
        if (!actionsByPlayer[pid]) actionsByPlayer[pid] = [];
        actionsByPlayer[pid].push(action.toObject());
      }
      data.players = data.players.map((player: any) => ({
        ...player,
        actions: actionsByPlayer[player._id.toString()] || [],
      }));
    } else {
      const actions = await Action.find({ lineUp: id }).populate("player");
      data.actions = actions.map((a) => {
        const obj = a.toObject();
        delete obj.lineUp;
        return obj;
      });
    }
  }
  return data;
};
