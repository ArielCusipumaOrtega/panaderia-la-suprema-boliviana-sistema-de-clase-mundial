import { InvoiceEntity } from './invoice.entity.js';

export abstract class BillingRepository {
  abstract findAll(): InvoiceEntity[];
  abstract findById(id: string): InvoiceEntity | null;
  abstract findByOrderId(pedidoId: string): InvoiceEntity | null;
  abstract create(invoice: InvoiceEntity): InvoiceEntity;
  abstract getNextInvoiceNumber(): number;
}
