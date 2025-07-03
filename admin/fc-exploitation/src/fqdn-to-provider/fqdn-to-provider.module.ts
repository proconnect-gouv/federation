import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FqdnToProvider } from './fqdn-to-provider.mongodb.entity';
import { FqdnToProviderService } from './fqdn-to-provider.service';

@Module({
  imports: [TypeOrmModule.forFeature([FqdnToProvider], 'fc-mongo')],
  controllers: [],
  providers: [FqdnToProviderService],
  exports: [FqdnToProviderService],
})
export class FqdnToProviderModule {}
