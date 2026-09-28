import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiExcludeController } from '@nestjs/swagger';
import { renderStorefrontHtml } from './views/storefront.view.js';

@ApiExcludeController()
@Controller()
export class StorefrontController {
  @Get()
  getHome(@Res() res: Response): void {
    res.type('html').send(renderStorefrontHtml());
  }

  @Get('portal')
  getPortal(@Res() res: Response): void {
    res.type('html').send(renderStorefrontHtml());
  }
}
