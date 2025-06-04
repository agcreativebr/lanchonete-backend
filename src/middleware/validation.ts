import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

// ✅ EXPORT CORRETO PARA validateBody
export const validateBody = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    console.log(
      'VALIDATION MIDDLEWARE - validateBody - Body recebido:',
      JSON.stringify(req.body, null, 2)
    );

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      console.error(
        'VALIDATION MIDDLEWARE - validateBody - Erro de validação:',
        JSON.stringify(error.details, null, 2)
      );
      // Retornar a primeira mensagem de erro para consistência com testes anteriores, mas logar todos os detalhes
      const firstErrorMessage = error.details[0].message.replace(/['"]/g, '');
      res.status(400).json({
        success: false,
        error: firstErrorMessage, // Mantendo o formato de erro esperado pelos testes
        details: error.details.map((detail) => ({
          // Enviando todos os detalhes para debug se necessário
          message: detail.message.replace(/['"]/g, ''),
          path: detail.path,
          type: detail.type,
        })),
      });
      return;
    }

    req.body = value;
    console.log(
      'VALIDATION MIDDLEWARE - validateBody - Body validado:',
      JSON.stringify(req.body, null, 2)
    );
    next();
  };
};

// ✅ EXPORT CORRETO PARA validateParams
export const validateParams = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    console.log(
      'VALIDATION MIDDLEWARE - validateParams - Params recebidos:',
      JSON.stringify(req.params, null, 2)
    );
    const { error, value } = schema.validate(req.params, {
      // Adicionado 'value' para consistência e uso futuro
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      console.error(
        'VALIDATION MIDDLEWARE - validateParams - Erro de validação:',
        JSON.stringify(error.details, null, 2)
      );
      const firstErrorMessage = error.details[0].message.replace(/['"]/g, '');
      res.status(400).json({
        success: false,
        error: firstErrorMessage,
        details: error.details.map((detail) => ({
          message: detail.message.replace(/['"]/g, ''),
          path: detail.path,
          type: detail.type,
        })),
      });
      return;
    }
    req.params = value; // Usar params validados
    console.log(
      'VALIDATION MIDDLEWARE - validateParams - Params validados:',
      JSON.stringify(req.params, null, 2)
    );
    next();
  };
};

// ✅ EXPORT CORRETO PARA validateQuery
export const validateQuery = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    console.log(
      'VALIDATION MIDDLEWARE - validateQuery - Query recebida:',
      JSON.stringify(req.query, null, 2)
    );
    const { error, value } = schema.validate(req.query, {
      // Adicionado 'value'
      abortEarly: false,
      allowUnknown: true, // Query params podem ter campos desconhecidos (ex: ordenação, filtros não mapeados)
      stripUnknown: false, // Não remover campos desconhecidos da query por padrão
    });

    if (error) {
      console.error(
        'VALIDATION MIDDLEWARE - validateQuery - Erro de validação:',
        JSON.stringify(error.details, null, 2)
      );
      const firstErrorMessage = error.details[0].message.replace(/['"]/g, '');
      res.status(400).json({
        success: false,
        error: firstErrorMessage,
        details: error.details.map((detail) => ({
          message: detail.message.replace(/['"]/g, ''),
          path: detail.path,
          type: detail.type,
        })),
      });
      return;
    }
    req.query = value; // Usar query validada
    console.log(
      'VALIDATION MIDDLEWARE - validateQuery - Query validada:',
      JSON.stringify(req.query, null, 2)
    );
    next();
  };
};
