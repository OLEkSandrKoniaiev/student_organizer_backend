import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { FileService } from '../services/file.service';
import { registerUserSchema, loginUserSchema } from '../validation/user.validation';
import Joi from 'joi';
import { JwtService } from '../services/jwt.service';
import { UserModel } from '../models/user.model';
import { ILoginUserDTO } from '../types/user.types';

export class AuthController {
  static async validateRegister(req: Request, res: Response, next: NextFunction) {
    try {
      await registerUserSchema.validateAsync(req.body, { abortEarly: false });
      next();
    } catch (error: unknown) {
      if (error instanceof Joi.ValidationError) {
        const errors = error.details.map((detail: Joi.ValidationErrorItem) => detail.message);
        return res.status(400).json({ errors });
      }
      console.error('Unexpected error during validation:', error);
      return res.status(500).json({ error: 'An unexpected error occurred during validation.' });
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use.' }); //409 - Conflict
      }

      let avatarPath: string | undefined = undefined;
      if (req.file) {
        try {
          avatarPath = await FileService.saveAvatar(req.file);
        } catch (fileError) {
          console.error('Error saving avatar file:', fileError);
          return res.status(500).json({ error: 'Failed to save avatar image.' });
        }
      }

      const newUser = await UserRepository.createUser({
        username,
        email,
        password,
        photo: avatarPath,
      });

      const newUserId = newUser._id as string;

      const accessToken = JwtService.generateAccessToken(newUserId.toString());

      return res.status(201).json({
        message: 'User registered successfully!',
        accessToken: accessToken,
      });
    } catch (error: unknown) {
      console.error('Error in AuthController.createUser:', error);
      if (error instanceof Error && error.message.includes('JWT_ACCESS_SECRET')) {
        return res.status(500).json({ error: 'Server configuration error: JWT secret not set.' });
      }
      return res.status(500).json({ error: 'Something went wrong on the server.' });
    }
  }

  static async validateLogin(req: Request, res: Response, next: NextFunction) {
    try {
      await loginUserSchema.validateAsync(req.body, { abortEarly: false });
      next();
    } catch (error: unknown) {
      if (error instanceof Joi.ValidationError) {
        const errors = error.details.map((detail: Joi.ValidationErrorItem) => detail.message);
        return res.status(400).json({ errors });
      }
      console.error('Unexpected error during login validation:', error);
      return res.status(500).json({ error: 'An unexpected error occurred during validation.' });
    }
  }

  static async loginUser(req: Request, res: Response) {
    try {
      const { email, password }: ILoginUserDTO = req.body;

      const user = await UserModel.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const userId = user._id as string;
      const accessToken = JwtService.generateAccessToken(userId.toString());

      return res.status(200).json({ accessToken });
    } catch (error: unknown) {
      console.error('Error in AuthController.loginUser:', error);
      if (error instanceof Error && error.message.includes('JWT_ACCESS_SECRET')) {
        return res.status(500).json({ error: 'Server configuration error: JWT secret not set.' });
      }
      return res.status(500).json({ error: 'Something went wrong on the server.' });
    }
  }
}
