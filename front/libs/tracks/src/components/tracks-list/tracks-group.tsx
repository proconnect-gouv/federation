import React from 'react';

import { ucfirst } from '@fc/common';
import { EnhancedTrack, TracksConfig } from '../../interfaces';
import { orderTracesByDateAsc } from '../../utils';
import { TrackCardComponent } from '../track-card';

export type TracksMonthGroupProps = {
  label: string;
  traces: EnhancedTrack[];
  options: TracksConfig;
};

export const TracksGroupComponent = ({
  label,
  traces,
  options,
}: TracksMonthGroupProps) => (
  <section className="mb40">
    <h6 className="pb12 mb16">
      <b>{ucfirst(label)}</b>
    </h6>
    {traces.sort(orderTracesByDateAsc).map((trace: EnhancedTrack) => (
      <TrackCardComponent key={trace.trackId} trace={trace} options={options} />
    ))}
  </section>
);

TracksGroupComponent.displayName = 'TracesMonthGroupComponent';
