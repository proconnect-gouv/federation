import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TracksProtocol } from '@fc/microservices';
import { LoggerService } from '@fc/logger';
import { CsmrTracksService } from './csmr-tracks.service';

@Controller()
export class CsmrTracksController {
  constructor(
    private readonly logger: LoggerService,
    private readonly csmrTracks: CsmrTracksService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @MessagePattern(TracksProtocol.Commands.GET)
  async getTracks(@Payload() payload): Promise<string> {
    this.logger.debug(
      `New message received with pattern "${TracksProtocol.Commands.GET}"`,
    );
    this.logger.trace({ payload });

    const tracks = await this.csmrTracks.getList(payload);

    return tracks;
  }
}
