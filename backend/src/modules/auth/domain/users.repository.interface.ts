import { UserEntity } from './user.entity.js';

export abstract class UsersRepository {
  abstract findByEmail(email: string): UserEntity | null;
  abstract findById(id: string): UserEntity | null;
  abstract create(user: UserEntity): UserEntity;
  abstract update(id: string, updates: Partial<UserEntity>): UserEntity;
}
