import { EnhancedTrace } from '../types';

function orderTracesByDateAsc(a: EnhancedTrace, b: EnhancedTrace) {
  const key1 = new Date(a.date).getTime();
  const key2 = new Date(b.date).getTime();
  return key1 - key2;
}

export default orderTracesByDateAsc;
