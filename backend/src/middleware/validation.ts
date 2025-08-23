import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from './errorHandler';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors: Array<{ field: string; message: string }> = [];
    errors.array().map(err => {
      if (err.type === 'field') {
        extractedErrors.push({ field: err.path, message: err.msg });
      }
    });

    throw new ValidationError(`Validation failed: ${extractedErrors.map(e => e.message).join(', ')}`);
  };
};

export const validationErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof ValidationError) {
    res.status(400).json({
      success: false,
      error: {
        message: error.message,
        type: 'validation_error',
      },
      timestamp: new Date().toISOString(),
      path: req.path,
    });
    return;
  }
  next(error);
};