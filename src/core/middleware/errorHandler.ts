import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../errors/AppError';
import { logger } from '../utils/logger';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../types';

export async function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) {
  const requestId = req.requestId || 'unknown';
  const durationMs = req._startTime != null ? Date.now() - req._startTime : undefined;
  const log = req.log || logger;

  // Map Zod validation errors to ValidationError
  if (err instanceof ZodError) {
    err = new ValidationError('Validation failed', err.errors);
  }

  // Handle operational AppErrors
  if (err instanceof AppError) {
    log.warn({
      type: 'exception',
      message: err.message,
      errorName: err.name,
      statusCode: err.statusCode,
      requestId,
      userId: req.user?.userId,
      details: err instanceof ValidationError ? err.details : undefined,
      path: req.originalUrl || req.path,
      method: req.method,
      durationMs,
    });

    const response: ApiResponse<null> = {
      success: false,
      error: {
        message: err.message,
        details: err instanceof ValidationError ? err.details : undefined,
      },
      requestId,
    };

    return res.status(err.statusCode).json(response);
  }

  // Handle unexpected/system errors (500)
  log.error({
    type: 'exception',
    message: err.message || 'Internal Server Error',
    errorName: err.name || 'Error',
    stack: err.stack,
    requestId,
    userId: req.user?.userId,
    path: req.originalUrl || req.path,
    method: req.method,
    statusCode: 500,
    durationMs,
  });

  // Write log to error_reporting database table
  try {
    await prisma.error_reporting.create({
      data: {
        error: `${err.message || 'Unknown Error'}\nStack: ${err.stack || 'No stack trace'}`,
        tablename: 'Express Application',
        query: `${req.method} ${req.originalUrl}\nBody: ${JSON.stringify(req.body)}`,
        client_id: req.user ? String(req.user.userId) : 'anonymous',
      },
    });
  } catch (dbErr: any) {
    log.error({
      type: 'exception',
      message: 'Failed to write to error_reporting table',
      error: dbErr.message,
      requestId,
    });
  }

  const response: ApiResponse<null> = {
    success: false,
    error: {
      message: 'An unexpected error occurred. Please contact support.',
    },
    requestId,
  };

  return res.status(500).json(response);
}
