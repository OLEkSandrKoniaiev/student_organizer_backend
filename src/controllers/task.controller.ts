import { NextFunction, Request, Response } from 'express';
import { TaskRepository } from '../repositories/task.repository';
import { FileService } from '../services/file.service';
import { IShowTaskDTO } from '../types/task.types';
import Joi from 'joi';
import {
  createTaskSchema,
  deleteTaskFileSchema,
  updateTaskFileSchema,
  partialUpdateTaskFileSchema,
} from '../validation/task.validation';

export class TaskController {
  static async validateTaskCreation(req: Request, res: Response, next: NextFunction) {
    try {
      await createTaskSchema.validateAsync(req.body, { abortEarly: false });
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

  static async createTask(req: Request, res: Response) {
    try {
      const { title, description } = req.body;
      if (!req.user?._id) {
        throw new Error('Invalid user');
      }
      const userId = req.user._id;

      let fileUrls: string[] | null = null;

      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        try {
          fileUrls = await FileService.saveTaskFiles(req.files as Express.Multer.File[]);
        } catch (fileError: unknown) {
          return res.status(400).json({ error: (fileError as Error).message });
        }
      }

      const fileJSON = fileUrls ? JSON.stringify(fileUrls) : null;

      const newTask = await TaskRepository.createTask({
        title: title,
        description: description,
        user: userId,
        files: fileJSON,
      });

      const taskResponse: IShowTaskDTO = {
        _id: newTask._id as string,
        title: newTask.title,
        description: newTask.description,
        done: newTask.done,
        files: newTask.files,
      };

      return res.status(201).json(taskResponse);
    } catch (error: unknown) {
      console.error('Error in TaskController.createTask:', error);
      return res.status(500).json({ error: 'Something went wrong on the server.' });
    }
  }

  static async getTask(req: Request, res: Response) {
    try {
      const userIdFromToken = req.user?._id;

      if (!userIdFromToken) {
        return res.status(401).json({ error: 'Cannot take user id from jwt access token.' });
      }

      const taskId = req.params.id;
      const retrievedTask = await TaskRepository.findById(taskId.toString());

      if (!retrievedTask) {
        return res.status(404).json({ error: 'Task not found' });
      }

      if (userIdFromToken != retrievedTask.user) {
        return res.status(403).json({ error: 'Task does not belong to user.' });
      }

      const response: IShowTaskDTO = {
        _id: retrievedTask._id as string,
        title: retrievedTask.title,
        description: retrievedTask.description,
        done: retrievedTask.done,
        files: retrievedTask.files,
      };

      return res.status(200).json(response);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Database query failed for getTask:', error.message, error.stack);
        return res.status(503).json({ error: 'Service is temporarily unavailable.' });
      } else {
        console.error('An unexpected error occurred in getTask endpoint:', error);
        return res.status(500).json({ error: 'Internal server error.' });
      }
    }
  }

  static async getPaginatedTasks(req: Request, res: Response) {
    try {
      const tasksPerPage = Number(req.query.tasksPerPage) || undefined;
      const page = Number(req.query.page) || undefined;

      if (!page || !tasksPerPage) {
        return res.status(400).json({ error: 'There is no query params' });
      }

      if (page <= 0 || tasksPerPage <= 0) {
        return res
          .status(400)
          .json({ error: 'Queries "page" and "tasksPerPage" have to be bigger than 0' });
      }

      const { _id: userId } = req.user!;

      const response = await TaskRepository.getPaginatedTasks(userId, tasksPerPage, page);

      return res.status(200).json(response);
    } catch (error: unknown) {
      console.error('Error in TaskController.getPaginatedTask:', error);
      return res.status(500).json({ error: 'Something went wrong on the server.' });
    }
  }

  static async deleteTask(req: Request, res: Response) {
    try {
      const userIdFromToken = req.user?._id;

      if (!userIdFromToken) {
        return res.status(401).json({ error: 'Cannot take user id from jwt access token.' });
      }

      const taskId = req.params.id;
      const retrievedTask = await TaskRepository.findById(taskId.toString());

      if (!retrievedTask) {
        return res.status(404).json({ error: 'Task not found' });
      }

      if (userIdFromToken != retrievedTask.user) {
        return res.status(403).json({ error: 'Task does not belong to user.' });
      }

      const files: string[] | null = retrievedTask.files ? JSON.parse(retrievedTask.files) : null;

      if (files && Array.isArray(files) && files.length > 0) {
        try {
          for (const file of files) {
            await FileService.deletePhoto(file);
          }
        } catch (fileError: unknown) {
          return res.status(400).json({ error: (fileError as Error).message });
        }
      }

      const isDeleted = await TaskRepository.deleteById(taskId.toString());
      if (!isDeleted) {
        return res.status(404).json({ error: 'Task not found' });
      }

      return res.status(200).json({ message: 'Task was successfully deleted.' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error in deleteTask:', error.message, error.stack);
        if (error.message.includes('not found')) {
          return res.status(404).json({ error: 'User not found' });
        }
        return res.status(503).json({ error: 'Service is temporarily unavailable.' });
      } else {
        console.error('An unexpected error occurred in deleteTask endpoint:', error);
        return res.status(500).json({ error: 'Internal server error.' });
      }
    }
  }

  static async validateTaskFileDeleting(req: Request, res: Response, next: NextFunction) {
    try {
      await deleteTaskFileSchema.validateAsync(req.body, { abortEarly: false });
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

  static async deleteTaskFile(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      const { url } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Cannot take user id from jwt access token.' });
      }

      const taskId = req.params.id;
      const task = await TaskRepository.findById(taskId.toString());

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      if (userId != task.user) {
        return res.status(403).json({ error: 'Task does not belong to user.' });
      }

      const files = task.files ? (JSON.parse(task.files) as string[]) : [];
      if (!files.includes(url)) {
        return res.status(404).json({ error: 'File not found in task.' });
      }

      await FileService.deletePhoto(url);

      const updatedFiles = files.filter((file) => file !== url);

      const updatedTask = await TaskRepository.deleteFileByUrl(
        taskId.toString(),
        updatedFiles.length > 0 ? JSON.stringify(updatedFiles) : null,
      );

      if (!updatedTask) {
        return res.status(404).json({ error: 'Task not found after update.' });
      }

      const response: IShowTaskDTO = {
        _id: updatedTask._id as string,
        title: updatedTask.title,
        description: updatedTask.description,
        done: updatedTask.done,
        files: updatedTask.files,
      };

      return res.status(200).json(response);
    } catch (error: unknown) {
      console.error('Error in deleteTaskFile:', error);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  }

  static async getTasks(req: Request, res: Response) {
    try {
      const { _id: userId } = req.user!;

      const tasksData = await TaskRepository.getTasks(userId);

      return res.status(200).json(tasksData);
    } catch (error) {
      console.error('Error in TaskController.getTasks:', error);
      return res.status(500).json({ error: 'Something went wrong on the server.' });
    }
  }

  static async validatePartialUpdateTask(req: Request, res: Response, next: NextFunction) {
    try {
      await partialUpdateTaskFileSchema.validateAsync(req.body, { abortEarly: false });
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

  static async partialUpdateTask(req: Request, res: Response) {
    try {
      const { _id: userId } = req.user!;

      const taskId = req.params.id;
      const retrievedTask = await TaskRepository.findById(taskId.toString());

      if (!retrievedTask) {
        return res.status(404).json({ error: 'Task not found' });
      }

      if (userId != retrievedTask.user) {
        return res.status(403).json({ error: 'Task does not belong to user.' });
      }

      const { title, description } = req.body;
      const done = req.body.done !== undefined ? req.body.done.toLowerCase() === 'true' : undefined;

      let fileUrls: string[] | undefined = undefined;

      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        try {
          fileUrls = await FileService.saveTaskFiles(req.files as Express.Multer.File[]);
        } catch (fileError: unknown) {
          return res.status(400).json({ error: (fileError as Error).message });
        }
      }

      const fileJSON = fileUrls ? JSON.stringify(fileUrls) : undefined;

      if (fileJSON) {
        const files: string[] | null = retrievedTask.files ? JSON.parse(retrievedTask.files) : null;

        if (files && Array.isArray(files) && files.length > 0) {
          try {
            for (const file of files) {
              await FileService.deletePhoto(file);
            }
          } catch (fileError: unknown) {
            return res.status(400).json({ error: (fileError as Error).message });
          }
        }
      }

      const updatedTask = await TaskRepository.updatePartial(taskId.toString(), {
        title: title,
        description: description,
        files: fileJSON,
        done: done,
      });

      if (!updatedTask) {
        return res.status(404).json({ error: 'Task not found after update.' });
      }

      const response: IShowTaskDTO = {
        _id: updatedTask._id as string,
        title: updatedTask.title,
        description: updatedTask.description,
        done: updatedTask.done,
        files: updatedTask.files,
      };

      return res.status(200).json(response);
    } catch (error: unknown) {
      console.error('Error in partialUpdateTask:', error);

      if (error instanceof Error) {
        if (error.message.includes('No fields provided for update')) {
          return res.status(400).json({ error: error.message });
        }
        if (error.message.includes('not found')) {
          return res.status(404).json({ error: error.message });
        }
      }

      return res.status(500).json({ error: 'Internal server error.' });
    }
  }

  static async validateUpdateTask(req: Request, res: Response, next: NextFunction) {
    try {
      await updateTaskFileSchema.validateAsync(req.body, { abortEarly: false });
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

  static async updateTask(req: Request, res: Response) {
    try {
      const { _id: userId } = req.user!;

      const taskId = req.params.id;
      const retrievedTask = await TaskRepository.findById(taskId.toString());

      if (!retrievedTask) {
        return res.status(404).json({ error: 'Task not found' });
      }

      if (userId != retrievedTask.user) {
        return res.status(403).json({ error: 'Task does not belong to user.' });
      }

      const { title, description } = req.body;
      const done = req.body.done.toLowerCase() === 'true';

      let fileUrls: string[] | undefined = undefined;

      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        try {
          fileUrls = await FileService.saveTaskFiles(req.files as Express.Multer.File[]);
        } catch (fileError: unknown) {
          return res.status(400).json({ error: (fileError as Error).message });
        }
      }

      const fileJSON = fileUrls ? JSON.stringify(fileUrls) : undefined;

      if (fileJSON) {
        const files: string[] | null = retrievedTask.files ? JSON.parse(retrievedTask.files) : null;

        if (files && Array.isArray(files) && files.length > 0) {
          try {
            for (const file of files) {
              await FileService.deletePhoto(file);
            }
          } catch (fileError: unknown) {
            return res.status(400).json({ error: (fileError as Error).message });
          }
        }
      }

      const updatedTask = await TaskRepository.update(taskId.toString(), {
        title: title,
        description: description,
        files: fileJSON,
        done: done,
      });

      if (!updatedTask) {
        return res.status(404).json({ error: 'Task not found after update.' });
      }

      const response: IShowTaskDTO = {
        _id: updatedTask._id as string,
        title: updatedTask.title,
        description: updatedTask.description,
        done: updatedTask.done,
        files: updatedTask.files,
      };

      return res.status(200).json(response);
    } catch (error: unknown) {
      console.error('Error in updateTask:', error);

      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return res.status(404).json({ error: error.message });
        }
      }

      return res.status(500).json({ error: 'Internal server error.' });
    }
  }
}
