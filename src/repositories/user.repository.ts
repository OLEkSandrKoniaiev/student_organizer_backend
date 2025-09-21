import { UserModel } from '../models/user.model';
import { ICreateUserDTO, IUserResponseDTO } from '../types/user.types';

export class UserRepository {
  static async createUser(data: ICreateUserDTO): Promise<IUserResponseDTO> {
    const user = await UserModel.create(data);
    return user.toJSON();
  }

  static async findByEmail(email: string): Promise<IUserResponseDTO | null> {
    const user = await UserModel.findOne({ email });
    return user ? user.toJSON() : null;
  }
}
