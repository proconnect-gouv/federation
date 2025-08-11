/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScopesService } from './scopes.service';
import { Scopes } from './scopes.mongodb.entity';
import { Claims, ClaimsService } from '../claims';

import { ScopesController } from './scopes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Scopes, Claims], 'fc-mongo')],
  controllers: [ScopesController],
  providers: [ScopesService, ClaimsService],
  exports: [ScopesService],
})
export class ScopesModule {}
