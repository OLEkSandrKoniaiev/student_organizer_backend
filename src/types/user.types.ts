export interface IUser {
  username: string;
  email: string;
  password?: string;
  photo?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
