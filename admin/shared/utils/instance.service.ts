import { ConfigService, InjectConfig } from 'nestjs-config';
import { Injectable } from '@nestjs/common';
import { Platform } from './instance.enum';

@Injectable()
export class InstanceService {
  constructor(@InjectConfig() private readonly configService: ConfigService) {}

  isFcaLow() {
    const { instanceFor } = this.configService.get('app');
    return instanceFor === Platform.FCA_LOW;
  }

  isFcpHigh() {
    const { instanceFor } = this.configService.get('app');
    return instanceFor === Platform.FCP_HIGH;
  }

  isCl() {
    const { instanceFor } = this.configService.get('app');
    return instanceFor === Platform.CL;
  }
}
