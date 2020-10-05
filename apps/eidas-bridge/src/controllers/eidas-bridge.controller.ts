import {
  Controller,
  Get,
  Render,
} from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { CoreFcpRoutes } from '../enums';

@Controller()
export class EidasBridgeController {
  constructor(
    private readonly config: ConfigService
  ) {}

  @Get(CoreFcpRoutes.DEFAULT)
  @Render('default')
  getDefault() {
    const message = "Hello Eidas";

    return { message };
  }
}
