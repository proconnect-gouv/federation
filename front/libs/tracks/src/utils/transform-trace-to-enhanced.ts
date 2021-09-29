import { DateTime } from 'luxon';

import { Track, EnhancedTrack } from '../interfaces';

export function transformTraceToEnhanced(trace: Track): EnhancedTrack {
  const datetime = DateTime.fromISO(trace.date);
  return { ...trace, datetime };
}
