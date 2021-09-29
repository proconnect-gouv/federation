import { TrackList } from '../interfaces';

export function orderGroupByKeyAsc(groupA: TrackList, groupB: TrackList) {
  const uniqKeyA = groupA[0];
  const uniqKeyB = groupB[0];
  return uniqKeyB - uniqKeyA;
}
