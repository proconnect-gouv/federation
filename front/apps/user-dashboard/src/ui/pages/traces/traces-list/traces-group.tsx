import React from 'react';

import ucFirst from '../../../../libs/utils/strings/uc-first';
import TraceCard from './card';
import { EnhancedTrace } from './types';
import { orderTracesByDateAsc } from './utils';

type TracesMonthGroupProps = {
  label: string;
  traces: EnhancedTrace[];
};

const TracesMonthGroupComponent = React.memo(
  ({ label, traces }: TracesMonthGroupProps) => (
    <section className="mb40">
      <h6 className="pb12 mb16">
        <b>{ucFirst(label)}</b>
      </h6>
      {traces.sort(orderTracesByDateAsc).map((trace: EnhancedTrace) => (
        <TraceCard key={trace.trackId} trace={trace} />
      ))}
    </section>
  ),
);

TracesMonthGroupComponent.displayName = 'TracesMonthGroupComponent';

export default TracesMonthGroupComponent;
