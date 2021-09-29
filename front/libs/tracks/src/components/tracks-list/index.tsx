import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';

import { TracksGroupComponent } from './tracks-group';
import {
  groupTracksByMonth,
  orderGroupByKeyAsc,
  transformTraceToEnhanced,
} from '../../utils';
import { TrackList, TracksConfig } from '../../interfaces';

export type TracksListComponentProps = {
  options: TracksConfig;
};

export const TracksListComponent = ({ options }: TracksListComponentProps) => {
  const isMounted = useRef(false);

  const [traces, setTraces] = useState([]);

  const responseErrorHandler = useCallback(() => {
    // @TODO
    // afficher une erreur lorsque le chargement
    // des traces ne s'est pas effectué -> @maxime
  }, []);

  const responseSuccessHandler = useCallback(({ data }) => {
    setTraces(data);
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      axios
        .get(options.API_ROUTE_TRACKS)
        .then(responseSuccessHandler)
        .catch(responseErrorHandler);
    }
  });

  return (
    <div className="mt40">
      {traces
        .map(transformTraceToEnhanced)
        .reduce(groupTracksByMonth.bind(null, options), [])
        .sort(orderGroupByKeyAsc)
        .map(([key, { label, traces: items }]: TrackList) => (
          <TracksGroupComponent
            key={key}
            label={label}
            traces={items}
            options={options}
          />
        ))}
    </div>
  );
};
