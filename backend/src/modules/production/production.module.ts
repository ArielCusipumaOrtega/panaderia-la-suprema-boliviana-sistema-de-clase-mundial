import { Module } from '@nestjs/common';
import { ProductionService } from './production.service.js';
import { ProductionController } from './production.controller.js';

@Module({
  controllers: [ProductionController],
  providers: [ProductionService],
  exports: [ProductionService],
})
export class ProductionModule {}
