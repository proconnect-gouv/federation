/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClaimsService } from './claims.service';
import { Claims } from './claims.mongodb.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Claims], 'fc-mongo')],
  providers: [ClaimsService],
  exports: [ClaimsService],
})
export class ClaimsModule {}
