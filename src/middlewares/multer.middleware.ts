import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

// Middleware для обробки Multer-помилок
export const handleMulterError = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Only one avatar file is allowed.' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    console.error('Unexpected file upload error:', err);
    return res.status(500).json({ error: 'An unexpected error occurred during file upload.' });
  }
  next();
};
