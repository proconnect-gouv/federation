/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { ErrorModule } from '@fc/error';
import { HsmModule } from '@fc/hsm';
import { CsmrHsmController } from './csmr-hsm.controller';

@Module({
  imports: [ErrorModule, HsmModule],
  controllers: [CsmrHsmController],
})
export class CsmrHsmModule {}
