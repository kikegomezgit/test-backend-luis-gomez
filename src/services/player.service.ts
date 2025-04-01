import Player, { IPlayer } from "../models/player.model";
import redis from "../utils/redisClient";
const REDIS_KEY = "players:all";
const TTL_SECONDS = 60 * 60 * 24 * 15;

interface PlayerQueryOptions {
  position?: string;
  page: number;
  limit: number;
}

export const create = async (data: Partial<IPlayer>) => {
  const player = await Player.create(data);
  if (player && player._id) {
    await redis.del(REDIS_KEY);
    await redis.setEx(
      `player:${player._id}`,
      TTL_SECONDS,
      JSON.stringify(player)
    );
    return { success: true };
  } else {
    throw new Error("Failed to create player");
  }
};

export const insertMany = async (players: Partial<IPlayer>[]) => {
  const result = await Player.insertMany(players);
  await redis.del(REDIS_KEY);

  for (const player of result) {
    await redis.setEx(
      `player:${player._id}`,
      TTL_SECONDS,
      JSON.stringify(player)
    );
  }

  return result;
};

export const update = async (id: string, data: Partial<IPlayer>) => {
  const updated = await Player.findByIdAndUpdate(id, data, { new: true });
  if (updated) {
    await redis.setEx(
      `player:${updated._id}`,
      TTL_SECONDS,
      JSON.stringify(updated)
    );
    await redis.del(REDIS_KEY);
  }
  return updated;
};

export const remove = async (id: string) => {
  const deleted = await Player.findByIdAndDelete(id);
  if (deleted) {
    await redis.del(`player:${id}`);
    await redis.del(REDIS_KEY);
  }
  return deleted;
};

export const getAll = async (options: Partial<PlayerQueryOptions> = {}) => {
  const position = options.position;
  const page = options.page ?? 1;
  const limit = options.limit ?? 15;
  const cached = await redis.get(REDIS_KEY);
  if (cached) {
    const allPlayers = JSON.parse(cached);
    const filtered = position
      ? allPlayers.filter(
          (p: any) => p.position.toLowerCase() === position.toLowerCase()
        )
      : allPlayers;

    const paginated = filtered.slice((page - 1) * limit, page * limit);
    return {
      players: paginated,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }

  const filter = position ? { position } : {};
  const players = await Player.find(filter);

  await redis.setEx(REDIS_KEY, TTL_SECONDS, JSON.stringify(players));

  const paginated = players.slice((page - 1) * limit, page * limit);

  return {
    players: paginated,
    total: players.length,
    page,
    limit,
    totalPages: Math.ceil(players.length / limit),
  };
};
