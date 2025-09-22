import multer from 'multer';
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { handleMulterError } from '../middlewares/multer.middleware';
import { TaskController } from '../controllers/task.controller';
import { validateObjectIdParam } from '../middlewares/id.middleware';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get('/', authMiddleware, TaskController.getTasks);
router.get('/all', authMiddleware, TaskController.getPaginatedTasks);
router.get('/:id', authMiddleware, validateObjectIdParam('id'), TaskController.getTask);
router.post(
  '',
  authMiddleware,
  upload.array('files', 20),
  handleMulterError,
  TaskController.validateTaskCreation,
  TaskController.createTask,
);
router.put(
  '/:id',
  authMiddleware,
  validateObjectIdParam('id'),
  upload.array('files', 20),
  handleMulterError,
  TaskController.validateUpdateTask,
  TaskController.updateTask,
);
router.patch(
  '/:id',
  authMiddleware,
  validateObjectIdParam('id'),
  upload.array('files', 20),
  handleMulterError,
  TaskController.validatePartialUpdateTask,
  TaskController.partialUpdateTask,
);
router.delete('/:id', authMiddleware, TaskController.deleteTask);

router.put(
  '/:id/files',
  authMiddleware,
  validateObjectIdParam('id'),
  TaskController.validateTaskFileDeleting,
  TaskController.deleteTaskFile,
);

export default router;
