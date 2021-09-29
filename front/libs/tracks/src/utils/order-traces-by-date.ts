import { EnhancedTrack } from '../interfaces';

export function orderTracesByDateAsc(a: EnhancedTrack, b: EnhancedTrack) {
  const key1 = new Date(a.date).getTime();
  const key2 = new Date(b.date).getTime();
  return key2 - key1;
}
