import { Search } from '@elastic/elasticsearch/api/requestParams';
import { pick } from 'lodash';

import { Injectable } from '@nestjs/common';

import { IAppTracksDataService } from '@fc/csmr-tracks';
import { formatMultiMatchGroup } from '@fc/elasticsearch';
import { LoggerService } from '@fc/logger';
import { ICsmrTracksOutputTrack } from '@fc/tracks';

import { ICsmrTracksHighTracks, ICsmrTracksInputHigh } from '../interfaces';

/**
 * Array of available track's object attributes
 * used to validate the tracks received from Elasticsearch.
 * @see ICsmrTracksOutputTrack
 */
const TRACK_PROPERTIES = [
  'event',
  'date',
  'spName',
  'spAcr',
  'country',
  'city',
];

export const PLATFORM = 'FranceConnect+';

const SIX_MONTHS_AGO = 'now-6M/d';
const NOW = 'now';

const EVENTS_TO_INCLUDE: Partial<ICsmrTracksHighTracks>[] = [
  {
    event: 'FC_VERIFIED',
  },
  {
    event: 'FC_DATATRANSFER:CONSENTIDENTITY',
  },
  {
    event: 'FC_DATATRANSFER:CONSENT:DATA',
  },
  {
    event: 'DP_REQUESTED_FC_CHECKTOKEN',
  },
];

@Injectable()
export class CsmrTracksHighDataService implements IAppTracksDataService {
  constructor(protected readonly logger: LoggerService) {
    this.logger.setContext(this.constructor.name);
  }

  formatQuery(index: string, accountId: string): Search {
    const includes = formatMultiMatchGroup(EVENTS_TO_INCLUDE);

    const criteria = [
      { term: { accountId } },
      {
        range: {
          date: {
            gte: SIX_MONTHS_AGO,
            lt: NOW,
          },
        },
      },
      includes,
    ];

    const query: Search = {
      index,
      body: {
        from: 0,
        sort: [{ date: { order: 'desc' } }],
        query: {
          bool: {
            must: criteria,
          },
        },
      },
    };

    this.logger.trace({ query });

    return query;
  }

  /**
   * Get formated tracks reduced to their strict elements.
   * Elasticsearch add extra attributes to the stored data
   * that are not requiered.
   */
  async formattedTracks(
    rawTracks: ICsmrTracksInputHigh[],
  ): Promise<ICsmrTracksOutputTrack[]> {
    this.logger.debug('formattedTracks from core-high');
    const filteredProperties = rawTracks.map(
      ({ _id: trackId, _source: source }) => {
        const properties = pick(source, TRACK_PROPERTIES);
        const platform = PLATFORM;
        return { ...properties, trackId, platform, claims: null };
      },
    );
    return filteredProperties as ICsmrTracksOutputTrack[];
  }
}
