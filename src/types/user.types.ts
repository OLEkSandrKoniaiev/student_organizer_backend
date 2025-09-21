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

export type IUserResponseDTO = IUser & {
  _id: unknown;
};
