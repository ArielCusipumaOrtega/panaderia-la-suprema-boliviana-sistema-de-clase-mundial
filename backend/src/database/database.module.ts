import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service.js';

// Puertos de Dominio (Repository Interfaces / Ports)
import { ProductsRepository } from '../modules/products/domain/products.repository.interface.js';
import { BranchesRepository } from '../modules/branches/domain/branches.repository.interface.js';
import { UsersRepository } from '../modules/auth/domain/users.repository.interface.js';
import { OrdersRepository } from '../modules/orders/domain/orders.repository.interface.js';
import { BillingRepository } from '../modules/billing/domain/billing.repository.interface.js';
import { ProductionRepository } from '../modules/production/domain/production.repository.interface.js';

// Adaptadores de Infraestructura (PostgreSQL Implementations / Adapters)
import { PostgresProductsRepository } from './repositories/postgres-products.repository.js';
import { PostgresBranchesRepository } from './repositories/postgres-branches.repository.js';
import { PostgresUsersRepository } from './repositories/postgres-users.repository.js';
import { PostgresOrdersRepository } from './repositories/postgres-orders.repository.js';
import { PostgresBillingRepository } from './repositories/postgres-billing.repository.js';
import { PostgresProductionRepository } from './repositories/postgres-production.repository.js';

@Global()
@Module({
  providers: [
    DatabaseService,
    {
      provide: ProductsRepository,
      useClass: PostgresProductsRepository,
    },
    {
      provide: BranchesRepository,
      useClass: PostgresBranchesRepository,
    },
    {
      provide: UsersRepository,
      useClass: PostgresUsersRepository,
    },
    {
      provide: OrdersRepository,
      useClass: PostgresOrdersRepository,
    },
    {
      provide: BillingRepository,
      useClass: PostgresBillingRepository,
    },
    {
      provide: ProductionRepository,
      useClass: PostgresProductionRepository,
    },
  ],
  exports: [
    DatabaseService,
    ProductsRepository,
    BranchesRepository,
    UsersRepository,
    OrdersRepository,
    BillingRepository,
    ProductionRepository,
  ],
})
export class DatabaseModule {}
