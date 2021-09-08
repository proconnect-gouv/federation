import { DateTime } from 'luxon';

import { LUXON_FORMAT_MONTH_YEAR } from '../../../../../configs/constants';
import { EnhancedTrace, GroupOfTraces } from '../types';

export function createUniqueGroupKeyFromTraceDate(
  trace: EnhancedTrace,
): number {
  // crée une clé unique pour un groupe
  // a partir de l'année et du mois
  const next = DateTime.fromObject({
    month: trace.datetime.month,
    year: trace.datetime.year,
  }).toMillis();
  return next;
}

function groupTracksByMonth(
  acc: GroupOfTraces[],
  trace: EnhancedTrace,
  index: number,
): GroupOfTraces[] {
  const isFirstTrace = index === 0;
  const previousGroup = isFirstTrace ? null : acc[acc.length - 1];
  const previousGroupKey = (previousGroup && previousGroup[0]) || null;

  const currentGroupKey = createUniqueGroupKeyFromTraceDate(trace);
  const isNotSameMonthYearGroup = currentGroupKey !== previousGroupKey;
  const shouldCreateNewGroupOfTraces = isFirstTrace || isNotSameMonthYearGroup;

  const nextGroupOfTraces = (
    !shouldCreateNewGroupOfTraces
      ? acc.pop()
      : [currentGroupKey, { label: null, traces: [] }]
  ) as GroupOfTraces;

  nextGroupOfTraces[1].label = !shouldCreateNewGroupOfTraces
    ? nextGroupOfTraces[1].label
    : trace.datetime.toFormat(LUXON_FORMAT_MONTH_YEAR);

  nextGroupOfTraces[1].traces = !shouldCreateNewGroupOfTraces
    ? [...((previousGroup && previousGroup[1].traces) || []), trace]
    : [trace];

  return [...acc, nextGroupOfTraces];
}

export default groupTracksByMonth;
