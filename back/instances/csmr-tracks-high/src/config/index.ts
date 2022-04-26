/* istanbul ignore file */

// Tested by DTO

import { CsmrTracksHighConfig } from '../dto';
import Elasticsearch from './elasticsearch';
import Logger from './logger';
import IdpMappings from './mappings';
import Mongoose from './mongoose';
import TracksBroker from './tracks-broker';

export default {
  Logger,
  Mongoose,
  TracksBroker,
  Elasticsearch,
  IdpMappings,
} as CsmrTracksHighConfig;
