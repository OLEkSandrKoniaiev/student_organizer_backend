export interface IUser {
  username: string;
  email: string;
  password?: string;
  photo?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// DTOs (Data Transfer Object)
export interface ICreateUserDTO {
  username: string;
  email: string;
  password: string;
  photo?: string;
}

export interface ILoginUserDTO {
  email: string;
  password: string;
}

export interface IShowUserDTO {
  _id: string;
  username: string;
  email: string;
  photo?: string | null;
}

export interface IUpdateUserDTO {
  _id: string;
  username: string;
  photo?: string;
}

// Коли є необхідність у роботі з mongoose повертати справжній об'єкт
export type IUserResponseDTO = IUser & {
  _id: unknown;
};
