import { Module, DynamicModule } from '@nestjs/common';
import { ImplementationOf } from '@fc/common';
import { CryptographyService } from './cryptography.service';
import { IGateway } from './interfaces';
import { GATEWAY } from './tokens';

@Module({})
export class CryptographyModule {
  register(gateway: ImplementationOf<IGateway>): DynamicModule {
    return {
      module: CryptographyModule,
      providers: [
        CryptographyService,
        {
          provide: GATEWAY,
          useClass: gateway,
        }
      ],
      exports: [CryptographyService],
    }
  }
}
