import { Request, Response, NextFunction } from "express";
import Joi from "joi";

const idSchema = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .required();

export const validateMongoId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const { error } = idSchema.validate(id);
  if (error) {
    return res
      .status(400)
      .json({ message: "Invalid ID format", details: error.details });
  }

  next();
};
