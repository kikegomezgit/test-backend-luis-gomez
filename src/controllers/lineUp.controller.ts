import { Request, Response, NextFunction } from "express";
import * as lineUpService from "../services/lineUp.service";

export const upsert = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lineUp = await lineUpService.upsert(req.body);
    res.status(201).json(lineUp);
  } catch (err) {
    next(err);
  }
};

export const deleteOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await lineUpService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getLineUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const includePlayers = req.query.players === "true";
    const includeActions = req.query.actions === "true";

    const lineup = await lineUpService.getById(
      req.params.id,
      includeActions,
      includePlayers
    );

    res.json(lineup);
  } catch (err) {
    next(err);
  }
};
