/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { CsmrTracksController } from './csmr-tracks.controller';
import { CsmrTracksService } from './csmr-tracks.service';

@Module({
  imports: [],
  controllers: [CsmrTracksController],
  providers: [CsmrTracksService],
})
export class CsmrTracksModule {}
