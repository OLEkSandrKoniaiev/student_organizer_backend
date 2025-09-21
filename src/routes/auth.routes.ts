import multer from 'multer';
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { handleMulterError } from '../middlewares/multer.middleware';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post(
  '/register',
  upload.single('avatar'),
  handleMulterError,
  AuthController.validateRegister,
  AuthController.createUser,
);

export default router;
