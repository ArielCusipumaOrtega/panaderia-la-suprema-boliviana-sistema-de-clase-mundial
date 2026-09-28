import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../modules/auth/domain/users.repository.interface.js';
import { UserEntity } from '../../modules/auth/domain/user.entity.js';
import { DatabaseService } from '../database.service.js';

@Injectable()
export class PostgresUsersRepository implements UsersRepository {
  constructor(private readonly db: DatabaseService) {}

  findByEmail(email: string): UserEntity | null {
    return (
      this.db.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      ) || null
    );
  }

  findById(id: string): UserEntity | null {
    return this.db.users.find((u) => u.id === id) || null;
  }

  create(user: UserEntity): UserEntity {
    this.db.users.push(user);
    this.db.save();
    return user;
  }

  update(id: string, updates: Partial<UserEntity>): UserEntity {
    const idx = this.db.users.findIndex((u) => u.id === id);
    if (idx === -1) {
      throw new NotFoundException(`Usuario con ID '${id}' no encontrado`);
    }
    this.db.users[idx] = { ...this.db.users[idx], ...updates };
    this.db.save();
    return this.db.users[idx];
  }
}
