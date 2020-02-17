import { Controller, Get } from '@nestjs/common';
import { CoreFcpService } from './core-fcp.service';

@Controller()
export class CoreFcpController {
  constructor(private readonly coreFcpService: CoreFcpService) {}

  @Get()
  getHello(): string {
    return this.coreFcpService.getHello();
  }
}
