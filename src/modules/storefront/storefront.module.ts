import { Module } from '@nestjs/common';
import { StorefrontController } from './storefront.controller.js';

@Module({
  controllers: [StorefrontController],
})
export class StorefrontModule {}
