import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { REGIONES_BOLIVIA } from '../../common/constants/bolivia-regions.constant.js';
import { DeliveryType } from '../../common/enums/order-status.enum.js';
import { ShippingQuoteDto } from './dto/shipping-quote.dto.js';

@Injectable()
export class LogisticsService {
  constructor(private readonly db: DatabaseService) {}

  getAllDepartments() {
    return Object.values(REGIONES_BOLIVIA).map((reg) => {
      const sucursales = this.db.branches.filter(
        (b) => b.departamento === reg.departamento && b.activa,
      );
      return {
        ...reg,
        sucursalesDisponibles: sucursales.length,
        sucursales: sucursales.map((s) => ({
          id: s.id,
          codigo: s.codigo,
          nombre: s.nombre,
          ciudad: s.ciudad,
          direccion: s.direccion,
          telefono: s.telefono,
          horarioAtencion: s.horarioAtencion,
        })),
      };
    });
  }

  quoteShipping(dto: ShippingQuoteDto) {
    const region = REGIONES_BOLIVIA[dto.departamentoDestino];
    if (!region) {
      throw new BadRequestException('Departamento de Bolivia no reconocido');
    }

    const sucursalLocal = this.db.branches.find(
      (b) => b.departamento === dto.departamentoDestino && b.activa,
    );

    let costoEnvioBs = 0;
    let tiempoEstimado = '';
    let sucursalAsignada = sucursalLocal;
    let advertencias: string[] = [];

    // Validar productos según tipo de envío
    if (dto.productosIds && dto.productosIds.length > 0) {
      for (const pid of dto.productosIds) {
        const prod = this.db.products.find((p) => p.id === pid);
        if (
          prod &&
          !prod.aptoEnvioNacional &&
          dto.tipoEntrega === DeliveryType.ENVIO_NACIONAL
        ) {
          advertencias.push(
            `El producto "${prod.nombre}" es de consumo fresco inmediato y no resiste viaje interdepartamental prolongado. Te sugerimos retiro local o delivery express en tu ciudad.`,
          );
        }
      }
    }

    if (dto.tipoEntrega === DeliveryType.RETIRO_SUCURSAL) {
      costoEnvioBs = 0;
      tiempoEstimado = 'Listo para retiro en 15 - 30 minutos';
    } else if (dto.tipoEntrega === DeliveryType.EXPRESS_LOCAL) {
      if (!sucursalLocal) {
        throw new BadRequestException(
          `No contamos con sucursal física con horneada caliente en ${dto.departamentoDestino}. Por favor elija 'ENVIO_NACIONAL'.`,
        );
      }
      costoEnvioBs = region.costoEnvioExpressBs;
      tiempoEstimado = `${region.tiempoEstimadoExpressMin} minutos (Entrega en moto con caja térmica)`;
    } else if (dto.tipoEntrega === DeliveryType.ENVIO_NACIONAL) {
      costoEnvioBs = region.costoEnvioNacionalBs;
      tiempoEstimado = `${region.tiempoEstimadoNacionalHoras} horas (Despacho interdepartamental con empaque sellado)`;
      // Asignar casa matriz o sucursal principal
      if (!sucursalAsignada) {
        sucursalAsignada =
          this.db.branches.find((b) => b.esMatriz) || this.db.branches[0];
      }
    }

    return {
      departamento: dto.departamentoDestino,
      ciudad: dto.ciudadDestino,
      tipoEntrega: dto.tipoEntrega,
      costoEnvioBs,
      tiempoEstimado,
      sucursalSugerida: sucursalAsignada
        ? {
            id: sucursalAsignada.id,
            nombre: sucursalAsignada.nombre,
            direccion: sucursalAsignada.direccion,
            telefono: sucursalAsignada.telefono,
          }
        : null,
      coberturaValida: true,
      advertencias,
    };
  }
}
