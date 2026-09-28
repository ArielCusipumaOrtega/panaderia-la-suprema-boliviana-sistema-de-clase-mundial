import { Injectable, NotFoundException } from '@nestjs/common';
import {
  OrdersRepository,
  OrderFilterQuery,
} from '../../modules/orders/domain/orders.repository.interface.js';
import { OrderEntity } from '../../modules/orders/domain/order.entity.js';
import { OrderStatus } from '../../common/enums/order-status.enum.js';
import { DatabaseService } from '../database.service.js';

@Injectable()
export class PostgresOrdersRepository implements OrdersRepository {
  constructor(private readonly db: DatabaseService) {}

  findAll(query?: OrderFilterQuery): OrderEntity[] {
    let list = this.db.orders;

    if (query?.departamento) {
      list = list.filter((o) => o.departamentoDestino === query.departamento);
    }
    if (query?.sucursalId) {
      list = list.filter((o) => o.sucursalOrigenId === query.sucursalId);
    }
    if (query?.estado) {
      list = list.filter((o) => o.estado === query.estado);
    }
    if (query?.clienteCiNit) {
      list = list.filter((o) => o.clienteCiNit.includes(query.clienteCiNit!));
    }

    return list;
  }

  findById(id: string): OrderEntity | null {
    return (
      this.db.orders.find(
        (o) => o.id === id || o.codigoPedido.toUpperCase() === id.toUpperCase(),
      ) || null
    );
  }

  create(order: OrderEntity): OrderEntity {
    this.db.orders.unshift(order);
    this.db.save();
    return order;
  }

  updateStatus(id: string, estado: OrderStatus): OrderEntity {
    const order = this.findById(id);
    if (!order) {
      throw new NotFoundException(`Pedido '${id}' no encontrado`);
    }
    order.estado = estado;
    order.actualizadoEn = new Date().toISOString();
    this.db.save();
    return order;
  }

  update(id: string, updates: Partial<OrderEntity>): OrderEntity {
    const idx = this.db.orders.findIndex((o) => o.id === id);
    if (idx === -1) {
      throw new NotFoundException(`Pedido '${id}' no encontrado`);
    }
    this.db.orders[idx] = {
      ...this.db.orders[idx],
      ...updates,
      actualizadoEn: new Date().toISOString(),
    };
    this.db.save();
    return this.db.orders[idx];
  }
}
