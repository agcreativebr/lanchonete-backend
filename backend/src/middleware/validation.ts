import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Retorna todos os erros, não apenas o primeiro
      stripUnknown: true, // Remove campos não definidos no schema
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      res.status(400).json({
        success: false,
        error: 'Dados de entrada inválidos',
        details: errorMessages,
      });
      return;
    }

    // Substitui req.body pelos dados validados e limpos
    req.body = value;
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      res.status(400).json({
        success: false,
        error: 'Parâmetros inválidos',
        details: errorMessages,
      });
      return;
    }

    req.params = value;
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      res.status(400).json({
        success: false,
        error: 'Query parameters inválidos',
        details: errorMessages,
      });
      return;
    }

    req.query = value;
    next();
  };
};
