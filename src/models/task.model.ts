import mongoose, { Document, Schema } from 'mongoose';
import { ITask } from '../types/task.types';
import { IUserDocument } from './user.model';

export interface ITaskDocument extends ITask, Document {
  user: IUserDocument['_id'];
}

const TaskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    done: {
      type: Boolean,
      default: false,
    },
    files: {
      type: String,
      default: null,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_, ret) => {
        return ret;
      },
    },
  },
);

export const TaskModel = mongoose.model<ITaskDocument>('Task', TaskSchema);
