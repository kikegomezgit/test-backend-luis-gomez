import { Request, Response, NextFunction } from "express";
import * as playerService from "../services/player.service";
import Joi from "joi";

const updatePlayerSchema = Joi.object({
  nickname: Joi.string().required(),
  backNumber: Joi.number().required(),
  position: Joi.string()
    .valid("portero", "defensa", "mediocentro", "delantero")
    .required(),
});

export const updatePlayer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validated = await updatePlayerSchema.validateAsync(req.body);
    const updated = await playerService.update(req.params.id, validated);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const deletePlayer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await playerService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const player = await playerService.create(req.body);
    res.status(201).json(player);
  } catch (err) {
    next(err);
  }
};

export const insertManyPlayers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await playerService.insertMany(req.body.players);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { position, page = "1", limit = "15" } = req.query;

    const players = await playerService.getAll({
      position: position as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    res.json(players);
  } catch (err) {
    next(err);
  }
};
