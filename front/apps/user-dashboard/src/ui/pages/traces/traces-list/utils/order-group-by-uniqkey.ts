import { GroupOfTraces } from '../types';

function orderGroupByKeyAsc(groupA: GroupOfTraces, groupB: GroupOfTraces) {
  const uniqKeyA = groupA[0];
  const uniqKeyB = groupB[0];
  return uniqKeyA - uniqKeyB;
}

export default orderGroupByKeyAsc;
