import {
  ICreateTaskDTO,
  IPartialUpdateTaskDTO,
  IUpdateTaskDTO,
  ITaskResponseDTO,
} from '../types/task.types';
import { TaskModel } from '../models/task.model';

export class TaskRepository {
  static async createTask(data: ICreateTaskDTO): Promise<ITaskResponseDTO> {
    const task = await TaskModel.create(data);
    return task.toJSON();
  }

  static async findById(taskId: string): Promise<ITaskResponseDTO | null> {
    const task = await TaskModel.findById(taskId);
    return task ? task.toJSON() : null;
  }

  static async deleteById(taskId: string): Promise<boolean> {
    const result = await TaskModel.deleteOne({ _id: taskId });
    return result.deletedCount > 0;
  }

  static async deleteFileByUrl(
    taskId: string,
    updFiles: string | null,
  ): Promise<ITaskResponseDTO | null> {
    const updatedTask = await TaskModel.findByIdAndUpdate(
      taskId,
      { files: updFiles },
      { new: true },
    );

    if (!updatedTask) {
      throw new Error(`Task with id ${taskId} not found for update.`);
    }

    return updatedTask.toJSON();
  }

  static async getTasks(userId: string): Promise<{ tasks: ITaskResponseDTO[] }> {
    const tasks = await TaskModel.find({ user: userId })
      .select('_id title description files done')
      .sort({ createdAt: -1 });

    return { tasks: tasks.map((t) => t.toJSON()) };
  }

  static async getPaginatedTasks(
    userId: string,
    tasksPerPage: number,
    page: number,
  ): Promise<{
    tasks: ITaskResponseDTO[];
    taskTotalCount: number;
  }> {
    const skip = (page - 1) * tasksPerPage;

    const [tasks, count] = await Promise.all([
      TaskModel.find({ user: userId })
        .select('_id title description files done')
        .sort({ createdAt: -1 })
        .limit(tasksPerPage)
        .skip(skip),
      TaskModel.countDocuments({ user: userId }),
    ]);

    return {
      tasks: tasks.map((t) => t.toJSON()),
      taskTotalCount: count,
    };
  }

  static async updatePartial(
    taskId: string,
    data: IPartialUpdateTaskDTO,
  ): Promise<ITaskResponseDTO | null> {
    const updatedTask = await TaskModel.findByIdAndUpdate(taskId, data, {
      new: true,
      omitUndefined: true,
    });

    if (!updatedTask) {
      throw new Error(`Task with id ${taskId} not found for update.`);
    }

    return updatedTask.toJSON();
  }

  static async update(taskId: string, data: IUpdateTaskDTO): Promise<ITaskResponseDTO | null> {
    const updatedTask = await TaskModel.findByIdAndUpdate(taskId, data, { new: true });

    if (!updatedTask) {
      throw new Error(`Task with id ${taskId} not found for update.`);
    }

    return updatedTask.toJSON();
  }
}
