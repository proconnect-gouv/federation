import { Module, DynamicModule, Global } from '@nestjs/common';
import { ImplementationOf } from '@fc/common';
import { CryptographyService } from './cryptography.service';
import { IGateway } from './interfaces';
import { GATEWAY } from './tokens';

@Global()
@Module({})
export class CryptographyModule {
  static register(gateway: ImplementationOf<IGateway>): DynamicModule {
    return {
      module: CryptographyModule,
      providers: [
        CryptographyService,
        {
          provide: GATEWAY,
          useClass: gateway,
        },
      ],
      exports: [CryptographyService],
    };
  }
}
