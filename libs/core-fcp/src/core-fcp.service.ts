import { Injectable } from '@nestjs/common';

@Injectable()
export class CoreFcpService {
  getHello(): string {
    return 'Hello World FCP!';
  }
}
