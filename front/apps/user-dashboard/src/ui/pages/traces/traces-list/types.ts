import { DateTime } from 'luxon';

import { ITrace } from '../../../../interfaces';

export interface EnhancedTrace extends ITrace {
  datetime: DateTime;
}

export type GroupOfTraces = [
  number,
  {
    label: string;
    traces: EnhancedTrace[];
  },
];
