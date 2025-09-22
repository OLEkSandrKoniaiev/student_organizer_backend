export interface ITask {
  title: string;
  description: string | null;
  done: boolean;
  files: string | null;
  user: unknown;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateTaskDTO {
  title: string;
  description: string | null;
  files: string | null;
  user: unknown;
}

export interface IPartialUpdateTaskDTO {
  title?: string;
  description?: string | null;
  files?: string | null;
  done?: boolean;
}

export interface IUpdateTaskDTO {
  title: string;
  description?: string | null;
  files?: string | null;
  done: boolean;
}

export interface IShowTaskDTO {
  _id: string;
  title: string;
  description: string | null;
  files: string | null;
  done: boolean;
}

export type ITaskResponseDTO = ITask & {
  _id: unknown;
};
