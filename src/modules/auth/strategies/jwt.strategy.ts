import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from '../../../database/database.service.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  nombreCompleto: string;
  sucursalId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly db: DatabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'SECRETO_PANADERIA_BOLIVIANA_CLASE_MUNDIAL_2026',
    });
  }

  async validate(payload: JwtPayload) {
    const user = this.db.users.find((u) => u.id === payload.sub && u.activo);
    if (!user) {
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
