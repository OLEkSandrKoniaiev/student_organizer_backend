import { Request, Response, NextFunction } from 'express';

const isHex24 = (v: string) => /^[a-fA-F0-9]{24}$/.test(v);

export function validateObjectIdParam(paramName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const val = req.params[paramName];
    if (!isHex24(val)) {
      return res.status(400).json({
        error: 'Invalid ID format: input must be a 24 character hex string',
      });
    }
    next();
  };
}
