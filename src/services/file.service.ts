import { Express } from 'express';
import { cloudinaryService } from './cloudinary.service';
import path from 'path';

export class FileService {
  // Дозволені MIME-типи та розширення файлів
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  private static readonly ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

  private static getPublicIdFromUrl(url: string): string | null {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w{3,4})?$/);

    if (match && match[1]) {
      return match[1];
    }

    return null;
  }

  static async saveAvatar(file: Express.Multer.File): Promise<string> {
    // Перевіряємо тип файлу
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (
      !FileService.ALLOWED_MIME_TYPES.includes(file.mimetype) ||
      !FileService.ALLOWED_EXTENSIONS.includes(fileExtension)
    ) {
      throw new Error('Invalid file format. Only JPG, JPEG, PNG, GIF, WebP images are allowed.');
    }

    try {
      // Завантаження файлу в Cloudinary
      // file.buffer доступний завдяки multer.memoryStorage()
      const uploadResult = await cloudinaryService.uploadFile(file.buffer, 'avatars');

      // Повернення безпечного URL з Cloudinary
      // secure_url - це URL з HTTPS, який є кращим варіантом
      return uploadResult.secure_url;
    } catch (error: unknown) {
      console.error('Failed to upload avatar to Cloudinary:', error);
      throw new Error('Failed to save avatar file.');
    }
  }

  static async deleteAvatar(avatarUrl: string): Promise<void> {
    try {
      const publicId = FileService.getPublicIdFromUrl(avatarUrl);
      if (publicId) {
        await cloudinaryService.deleteFile(publicId);
      } else {
        console.warn(`Could not extract publicId from URL: ${avatarUrl}`);
      }
    } catch (error: unknown) {
      console.error('Failed to delete avatar from Cloudinary:', error);
      throw new Error('Failed to delete avatar file.');
    }
  }

  static async saveTaskFiles(files: Express.Multer.File[]): Promise<string[]> {
    for (const file of files) {
      const fileExtension = path.extname(file.originalname).toLowerCase();
      if (
        !FileService.ALLOWED_MIME_TYPES.includes(file.mimetype) ||
        !FileService.ALLOWED_EXTENSIONS.includes(fileExtension)
      ) {
        throw new Error(
          `Invalid file format for ${file.originalname}. Only JPG, PNG, GIF, WebP are allowed.`,
        );
      }
    }

    const uploadPromises = files.map((file) => cloudinaryService.uploadFile(file.buffer, 'tasks'));

    try {
      const uploadResults = await Promise.all(uploadPromises);
      return uploadResults.map((result) => result.secure_url);
    } catch (error) {
      console.error('Failed to upload task files to Cloudinary:', error);
      throw new Error('Failed to save task files.');
    }
  }

  static async deleteTaskFiles(fileUrls: string[]): Promise<void> {
    const deletePromises = fileUrls.map((url) => {
      const publicId = FileService.getPublicIdFromUrl(url);
      if (publicId) {
        return cloudinaryService.deleteFile(publicId);
      }
      console.warn(`Could not extract publicId from URL: ${url}`);
      return Promise.resolve();
    });

    try {
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Failed to delete task files from Cloudinary:', error);
      throw new Error('Failed to delete task files.');
    }
  }
}
