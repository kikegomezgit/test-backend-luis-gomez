import { Request, Response, NextFunction } from "express";
import * as actionService from "../services/action.service";
import Joi from "joi";

const getActionsQuerySchema = Joi.object({
  type: Joi.string()
    .valid("gol", "autogol", "asistencia", "amarilla", "roja")
    .optional(),
  lineUp: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  playerId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
});

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accion = await actionService.create(req.body);
    res.status(201).json(accion);
  } catch (err) {
    next(err);
  }
};

export const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { playerId, lineUpId } = req.query;
    const conteo = await actionService.count(
      playerId as string,
      lineUpId as string
    );
    res.json(conteo);
  } catch (err) {
    next(err);
  }
};

const idSchema = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .required();
export const deleteOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = await idSchema.validateAsync(req.params.id);
    await actionService.remove(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getAllActions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, lineUp, playerId, page, limit } =
      await getActionsQuerySchema.validateAsync(req.query);

    const result = await actionService.getAll({
      type,
      lineUp,
      playerId,
      page,
      limit,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};
