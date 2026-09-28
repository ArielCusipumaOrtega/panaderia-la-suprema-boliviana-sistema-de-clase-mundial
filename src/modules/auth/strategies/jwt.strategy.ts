import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersRepository } from '../domain/users.repository.interface.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  nombreCompleto: string;
  sucursalId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersRepo: UsersRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET ||
        'SECRETO_PANADERIA_BOLIVIANA_CLASE_MUNDIAL_2026',
    });
  }

  async validate(payload: JwtPayload) {
    const user = this.usersRepo.findById(payload.sub);
    if (!user || !user.activo) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }
    return {
      id: user.id,
      email: user.email,
      nombreCompleto: user.nombreCompleto,
      role: user.role,
      sucursalId: user.sucursalId,
      ciNit: user.ciNit,
      departamento: user.departamento,
    };
  }
}
