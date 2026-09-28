import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UsersRepository } from './domain/users.repository.interface.js';
import { UserEntity } from './domain/user.entity.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { UserRole } from '../../common/enums/role.enum.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = this.usersRepo.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.activo) {
      throw new UnauthorizedException(
        'La cuenta de usuario se encuentra deshabilitada',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      nombreCompleto: user.nombreCompleto,
      sucursalId: user.sucursalId,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      usuario: {
        id: user.id,
        email: user.email,
        nombreCompleto: user.nombreCompleto,
        role: user.role,
        ciNit: user.ciNit,
        telefono: user.telefono,
        departamento: user.departamento,
        ciudad: user.ciudad,
        sucursalId: user.sucursalId,
      },
    };
  }

  async register(dto: RegisterDto) {
    const existing = this.usersRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(
        'Ya existe un usuario registrado con este correo',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const newUser: UserEntity = {
      id: `usr-${uuidv4().substring(0, 8)}`,
      email: dto.email.toLowerCase(),
      passwordHash,
      nombreCompleto: dto.nombreCompleto,
      telefono: dto.telefono,
      ciNit: dto.ciNit,
      departamento: dto.departamento,
      ciudad: dto.ciudad,
      direccion: dto.direccion,
      role: dto.role || UserRole.CLIENTE,
      sucursalId: dto.sucursalId,
      activo: true,
      creadoEn: new Date().toISOString(),
    };

    this.usersRepo.create(newUser);

    this.logger.log(
      `Nuevo usuario registrado: ${newUser.email} (${newUser.role})`,
    );

    const payload = {
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
      nombreCompleto: newUser.nombreCompleto,
      sucursalId: newUser.sucursalId,
    };

    const token = this.jwtService.sign(payload);

    return {
      mensaje: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: newUser.id,
        email: newUser.email,
        nombreCompleto: newUser.nombreCompleto,
        role: newUser.role,
        ciNit: newUser.ciNit,
        departamento: newUser.departamento,
      },
    };
  }

  async getProfile(userId: string) {
    const user = this.usersRepo.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
