import { DateTime } from 'luxon';
import { EnhancedTrack, TrackList, TracksConfig } from '../interfaces';

export function createUniqueGroupKeyFromTraceDate(
  trace: EnhancedTrack,
): number {
  // crée une clé unique pour un groupe
  // a partir de l'année et du mois
  const next = DateTime.fromObject({
    month: trace.datetime.month,
    year: trace.datetime.year,
  }).toMillis();
  return next;
}

export function groupTracksByMonth(
  options: TracksConfig,
  acc: TrackList[],
  trace: EnhancedTrack,
  index: number,
): TrackList[] {
  const isFirstTrace = index === 0;
  const previousGroup = isFirstTrace ? null : acc[acc.length - 1];
  const previousGroupKey = (previousGroup && previousGroup[0]) || null;

  const currentGroupKey = createUniqueGroupKeyFromTraceDate(trace);
  const isNotSameMonthYearGroup = currentGroupKey !== previousGroupKey;
  const shouldCreateNewTrackList = isFirstTrace || isNotSameMonthYearGroup;

  const nextTrackList = (
    !shouldCreateNewTrackList
      ? acc.pop()
      : [currentGroupKey, { label: null, traces: [] }]
  ) as TrackList;

  nextTrackList[1].label = !shouldCreateNewTrackList
    ? nextTrackList[1].label
    : trace.datetime.toFormat(options.LUXON_FORMAT_MONTH_YEAR);

  nextTrackList[1].traces = !shouldCreateNewTrackList
    ? [...((previousGroup && previousGroup[1].traces) || []), trace]
    : [trace];

  const next = [...acc, nextTrackList];
  return next;
}
