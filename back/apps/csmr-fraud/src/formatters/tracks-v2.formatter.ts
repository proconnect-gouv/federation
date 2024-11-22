import { SearchHit } from '@elastic/elasticsearch/lib/api/types';

import { Injectable } from '@nestjs/common';

import { LoggerService } from '@fc/logger';
import {
  getLocationFromTracks,
  TracksFormatterAbstract,
  TracksFormatterMappingFailedException,
  TracksV2FieldsInterface,
} from '@fc/tracks-adapter-elasticsearch';

import { Platform } from '../enums';
import { TracksFormatterOutputInterface } from '../interfaces';
import { getReadableDateFromTime } from '../utils';

@Injectable()
export class TracksV2Formatter
  implements TracksFormatterAbstract<TracksFormatterOutputInterface>
{
  constructor(
    protected readonly logger: LoggerService,
    private readonly platform: Platform,
  ) {}

  formatTrack(
    rawTrack: SearchHit<TracksV2FieldsInterface>,
  ): TracksFormatterOutputInterface {
    try {
      const { _source } = rawTrack;
      const { spName, accountId, time, idpName } = _source;
      const { country, city } = getLocationFromTracks(_source);
      const date = getReadableDateFromTime(time);

      const output: TracksFormatterOutputInterface = {
        date,
        spName,
        country,
        city,
        idpName,
        platform: this.platform,
        accountId,
      };

      return output;
    } catch (error) {
      throw new TracksFormatterMappingFailedException(error);
    }
  }
}
