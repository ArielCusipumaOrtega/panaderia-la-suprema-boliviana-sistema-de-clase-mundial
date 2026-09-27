import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import {
  DatabaseService,
  InvoiceEntity,
} from '../../database/database.service.js';
import { GenerateInvoiceDto } from './dto/generate-invoice.dto.js';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly NIT_EMISOR = '3049182019';
  private readonly RAZON_SOCIAL_EMISOR =
    'PANADERIA & PASTELERIA ARTESANAL BOLIVIA S.R.L.';
  private readonly LEYENDA_SIAT =
    'Ley N° 453: El proveedor deberá suministrar el servicio en las modalidades y términos ofertados o convenidos.';

  constructor(private readonly db: DatabaseService) {}

  findAll() {
    return this.db.invoices;
  }

  findById(id: string): InvoiceEntity {
    const invoice = this.db.invoices.find(
      (inv) =>
        inv.id === id ||
        inv.numeroFactura.toString() === id ||
        inv.pedidoId === id,
    );
    if (!invoice) {
      throw new NotFoundException(
        `Factura con identificador '${id}' no encontrada`,
      );
    }
    return invoice;
  }

  async generateInvoice(dto: GenerateInvoiceDto): Promise<InvoiceEntity> {
    const order = this.db.orders.find(
      (o) => o.id === dto.pedidoId || o.codigoPedido === dto.pedidoId,
    );
    if (!order) {
      throw new NotFoundException(`Pedido ${dto.pedidoId} no encontrado`);
    }

    if (order.facturaId) {
      const existing = this.db.invoices.find((i) => i.id === order.facturaId);
      if (existing) {
        return existing;
      }
    }

    const branch =
      this.db.branches.find((b) => b.id === order.sucursalOrigenId) ||
      this.db.branches[0];

    const numeroFactura = this.db.invoices.length + 5001;
    const fechaEmision = new Date().toISOString();

    // Generar Código Único de Facturación (CUF) simulado conforme algoritmo estándar SIAT
    const fechaRaw = fechaEmision.replace(/[-:T.Z]/g, '').slice(0, 14);
    const cadenaParaCuf = `${this.NIT_EMISOR}${fechaRaw}0${numeroFactura}1`;
    const cufHash = createHash('sha256')
      .update(cadenaParaCuf)
      .digest('hex')
      .toUpperCase()
      .slice(0, 48);

    const cufd = `CUFD-${branch.departamento.substring(0, 3).toUpperCase()}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`;

    const nitCiCliente = dto.nitCiCliente || order.clienteCiNit || '0';
    const razonSocialCliente =
      dto.razonSocialCliente || order.razonSocialFactura || order.clienteNombre;

    // Enlace QR oficial SIAT
    const urlSiat = `https://siat.impuestos.gob.bo/consulta/QR?nit=${this.NIT_EMISOR}&cuf=${cufHash}&numero=${numeroFactura}&t=${order.totalBs}`;

    let qrSiatDataUri = '';
    try {
      qrSiatDataUri = await QRCode.toDataURL(urlSiat, {
        margin: 2,
        width: 250,
        color: { dark: '#0F172A', light: '#FFFFFF' },
      });
    } catch (err) {
      this.logger.error('Error generando QR SIAT', err);
    }

    const newInvoice: InvoiceEntity = {
      id: `fac-${uuidv4().substring(0, 8)}`,
      numeroFactura,
      cuf: cufHash,
      cufd,
      nitEmisor: this.NIT_EMISOR,
      razonSocialEmisor: this.RAZON_SOCIAL_EMISOR,
      sucursalNombre: branch.nombre,
      departamento: branch.departamento,
      nitCiCliente,
      razonSocialCliente,
      fechaEmision,
      montoTotalBs: order.totalBs,
      montoSujetoCreditoFiscalBs: order.totalBs,
      qrSiatDataUri,
      leyendaFiscal: this.LEYENDA_SIAT,
      pedidoId: order.id,
    };

    this.db.invoices.unshift(newInvoice);
    order.facturaId = newInvoice.id;
    this.db.save();

    this.logger.log(
      `Factura Electrónica SIAT emitida: N° ${newInvoice.numeroFactura} por Bs. ${newInvoice.montoTotalBs} para ${newInvoice.razonSocialCliente} (NIT/CI: ${newInvoice.nitCiCliente})`,
    );

    return newInvoice;
  }
}
