/* istanbul ignore file */

// Tested by DTO
import { CsmrTracksConfig } from '@fc/csmr-tracks';

import Elasticsearch from './elasticsearch';
import GeoipMaxmind from './geoip-maxmind';
import Logger from './logger';
import Mongoose from './mongoose';
import TracksBroker from './tracks-broker';

export default {
  Logger,
  Mongoose,
  TracksBroker,
  GeoipMaxmind,
  Elasticsearch,
} as CsmrTracksConfig;
