/* istanbul ignore file */

// Tested by DTO
import { CsmrTracksConfig } from '@fc/csmr-tracks';
import Logger from './logger';
import TracksBroker from './tracks-broker';
import Elasticsearch from './elasticsearch';
import Mongoose from './mongoose';

export default {
  Logger,
  Mongoose,
  TracksBroker,
  Elasticsearch,
} as CsmrTracksConfig;
