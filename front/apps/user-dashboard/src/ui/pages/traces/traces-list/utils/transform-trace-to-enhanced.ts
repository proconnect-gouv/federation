import { DateTime } from 'luxon';

import { ITrace } from '../../../../../interfaces';
import { EnhancedTrace } from '../types';

function transformTraceToEnhanced(trace: ITrace): EnhancedTrace {
  const datetime = DateTime.fromISO(trace.date);
  return { ...trace, datetime };
}

export default transformTraceToEnhanced;
