import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/app.error.js';
import {
  ResponseWrapper,
  type ApiErrorDetail,
} from '../utils/response-wrapper.js';

interface JsonSyntaxError extends SyntaxError {
  status?: number;
  type?: string;
}

export const notFoundHandler: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof ZodError) {
    const errors: ApiErrorDetail[] = error.issues.map((issue) => ({
      field: issue.path.map(String).join('.') || 'request',
      message: issue.message,
      code: issue.code,
    }));

    ResponseWrapper.error(res, 400, 'La solicitud contiene datos inválidos', errors);
    return;
  }

  const syntaxError = error as JsonSyntaxError;
  if (
    error instanceof SyntaxError &&
    (syntaxError.status === 400 || syntaxError.type === 'entity.parse.failed')
  ) {
    ResponseWrapper.error(res, 400, 'El cuerpo de la solicitud no contiene JSON válido', [
      {
        field: 'body',
        message: 'Revise la sintaxis del documento JSON',
        code: 'invalid_json',
      },
    ]);
    return;
  }

  if (error instanceof AppError) {
    ResponseWrapper.error(res, error.statusCode, error.message, error.errors);
    return;
  }

  console.error('[UnhandledError]', error);
  ResponseWrapper.error(res, 500, 'Error interno del servidor');
};
