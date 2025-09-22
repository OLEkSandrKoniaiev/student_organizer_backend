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
  upload.single('photo'),
  handleMulterError,
  AuthController.validateRegister,
  AuthController.createUser,
);
router.post('/login', AuthController.validateLogin, AuthController.loginUser);

export default router;
