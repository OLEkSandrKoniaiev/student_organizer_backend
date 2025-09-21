import { NextFunction, Request, Response } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { IShowUserDTO, IUpdateUserDTO } from '../types/user.types';
import { FileService } from '../services/file.service';
import { updateUserSchema } from '../validation/user.validation';
import Joi from 'joi';

export class UserController {
  static async getUser(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const existingUser = await UserRepository.findById(userId);

      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userDTO: IShowUserDTO = {
        _id: existingUser._id as string,
        username: existingUser.username,
        email: existingUser.email,
        photo: existingUser?.photo,
      };

      return res.status(200).json(userDTO);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Database query failed for getUser:', error.message, error.stack);
        return res.status(503).json({ error: 'Service is temporarily unavailable.' });
      } else {
        console.error('An unexpected error occurred in getUser endpoint:', error);
        return res.status(500).json({ error: 'Internal server error.' });
      }
    }
  }

  static async validateUserUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      await updateUserSchema.validateAsync(req.body, { abortEarly: false });
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

  static async updateUser(req: Request, res: Response) {
    try {
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { username }: IUpdateUserDTO = req.body;

      let profilePhotoPath: string | undefined = undefined;
      if (req.file) {
        try {
          profilePhotoPath = await FileService.savePhoto(req.file);
        } catch (fileError) {
          console.error('Error saving profile photo file:', fileError);
          return res.status(500).json({ error: 'Failed to save profile photo image.' });
        }
      }

      const updatedUser = await UserRepository.updateUser({
        _id: userId,
        username: username,
        photo: profilePhotoPath,
      });

      const userDTO: IShowUserDTO = {
        _id: updatedUser._id as string,
        username: updatedUser.username,
        email: updatedUser.email,
        photo: updatedUser.photo,
      };

      return res.status(200).json(userDTO);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error in updateUser:', error.message, error.stack);
        if (error.message.includes('not found')) {
          return res.status(404).json({ error: 'User not found' });
        }
        return res.status(503).json({ error: 'Service is temporarily unavailable.' });
      } else {
        console.error('An unexpected error occurred in updateUser endpoint:', error);
        return res.status(500).json({ error: 'Internal server error.' });
      }
    }
  }

  static async deletePhoto(req: Request, res: Response) {
    try {
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const existingUser = await UserRepository.findById(userId);

      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updatedUser = await UserRepository.deletePhoto(userId);

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (existingUser.photo) {
        await FileService.deletePhoto(existingUser.photo);
      }

      const userDTO: IShowUserDTO = {
        _id: updatedUser._id as string,
        username: updatedUser.username,
        email: updatedUser.email,
        photo: updatedUser.photo,
      };

      return res.status(200).json(userDTO);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error in deletePhoto:', error.message, error.stack);
        if (error.message.includes('not found')) {
          return res.status(404).json({ error: 'User not found' });
        }
        return res.status(503).json({ error: 'Service is temporarily unavailable.' });
      } else {
        console.error('An unexpected error occurred in deletePhoto endpoint:', error);
        return res.status(500).json({ error: 'Internal server error.' });
      }
    }
  }
}
