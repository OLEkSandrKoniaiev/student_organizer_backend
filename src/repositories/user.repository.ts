import { UserModel } from '../models/user.model';
import { ICreateUserDTO, IUpdateUserDTO, IUserResponseDTO } from '../types/user.types';

export class UserRepository {
  static async createUser(data: ICreateUserDTO): Promise<IUserResponseDTO> {
    const user = await UserModel.create(data);
    return user.toJSON();
  }

  static async updateUser(data: IUpdateUserDTO): Promise<IUserResponseDTO> {
    const { _id, ...updateData } = data;

    const updatedUser = await UserModel.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      throw new Error(`User with id ${_id} not found for update.`);
    }

    return updatedUser.toJSON();
  }

  static async deletePhoto(userId: string): Promise<IUserResponseDTO> {
    const updatedUser = await UserModel.findByIdAndUpdate(userId, { photo: null }, { new: true });

    if (!updatedUser) {
      throw new Error(`User with id ${userId} not found for update.`);
    }

    return updatedUser.toJSON();
  }

  static async findByEmail(email: string): Promise<IUserResponseDTO | null> {
    const user = await UserModel.findOne({ email });
    return user ? user.toJSON() : null;
  }

  static async findById(userId: string): Promise<IUserResponseDTO | null> {
    const user = await UserModel.findById(userId);
    return user ? user.toJSON() : null;
  }
}
