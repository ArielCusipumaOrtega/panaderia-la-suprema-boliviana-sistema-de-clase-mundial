import { Injectable } from '@nestjs/common';
import { BillingRepository } from '../../modules/billing/domain/billing.repository.interface.js';
import { InvoiceEntity } from '../../modules/billing/domain/invoice.entity.js';
import { DatabaseService } from '../database.service.js';

@Injectable()
export class PostgresBillingRepository implements BillingRepository {
  constructor(private readonly db: DatabaseService) {}

  findAll(): InvoiceEntity[] {
    return this.db.invoices;
  }

  findById(id: string): InvoiceEntity | null {
    return this.db.invoices.find((i) => i.id === id) || null;
  }

  findByOrderId(pedidoId: string): InvoiceEntity | null {
    return this.db.invoices.find((i) => i.pedidoId === pedidoId) || null;
  }

  create(invoice: InvoiceEntity): InvoiceEntity {
    this.db.invoices.push(invoice);
    this.db.save();
    return invoice;
  }

  getNextInvoiceNumber(): number {
    return this.db.invoices.length + 5001;
  }
}
