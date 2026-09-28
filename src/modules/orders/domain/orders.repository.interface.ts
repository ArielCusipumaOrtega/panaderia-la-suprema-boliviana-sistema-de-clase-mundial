import { OrderEntity } from './order.entity.js';
import { OrderStatus } from '../../../common/enums/order-status.enum.js';

export interface OrderFilterQuery {
  departamento?: string;
  sucursalId?: string;
  estado?: OrderStatus;
  clienteCiNit?: string;
}

export abstract class OrdersRepository {
  abstract findAll(query?: OrderFilterQuery): OrderEntity[];
  abstract findById(id: string): OrderEntity | null;
  abstract create(order: OrderEntity): OrderEntity;
  abstract updateStatus(id: string, estado: OrderStatus): OrderEntity;
  abstract update(id: string, updates: Partial<OrderEntity>): OrderEntity;
}
