import { DateTime } from 'luxon';

export interface Track {
  accountId: string;
  city: string;
  country: string;
  date: string;
  event: string;
  spAcr: string;
  spId: string;
  spName: string;
  trackId: string;
}

export interface EnhancedTrack extends Track {
  datetime: DateTime;
}

export type TrackList = [
  number,
  {
    label: string;
    traces: EnhancedTrack[];
  },
];

export interface TracksConfig {
  LUXON_FORMAT_HOUR_MINS: string;
  LUXON_FORMAT_TIMEZONE: string;
  LUXON_FORMAT_DAY: string;
  LUXON_FORMAT_MONTH_YEAR: string;
  API_ROUTE_TRACKS: string;
  API_ROUTE_USER_INFOS: string;
}
