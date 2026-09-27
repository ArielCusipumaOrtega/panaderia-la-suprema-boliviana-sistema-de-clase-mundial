import { Module, ValidationPipe } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { BranchesModule } from './modules/branches/branches.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { LogisticsModule } from './modules/logistics/logistics.module.js';
import { ProductionModule } from './modules/production/production.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { PaymentsModule } from './modules/payments/payments.module.js';
import { BillingModule } from './modules/billing/billing.module.js';
import { AnalyticsModule } from './modules/analytics/analytics.module.js';
import { StorefrontModule } from './modules/storefront/storefront.module.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { AllExceptionsFilter } from './common/filters/http-exception.filter.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    BranchesModule,
    ProductsModule,
    LogisticsModule,
    ProductionModule,
    OrdersModule,
    PaymentsModule,
    BillingModule,
    AnalyticsModule,
    StorefrontModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ whitelist: true, transform: true }),
    },
  ],
})
export class AppModule {}
