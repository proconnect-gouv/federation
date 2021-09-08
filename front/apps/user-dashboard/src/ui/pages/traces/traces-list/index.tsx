import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';

import { API_ROUTE_TRACES } from '../../../../configs/constants';
import TracesGroup from './traces-group';
import { GroupOfTraces } from './types';
import {
  groupTracksByMonth,
  orderGroupByKeyAsc,
  transformTraceToEnhanced,
} from './utils';

const TraceCardList = () => {
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
      isMounted.current = false;
      axios
        .get(API_ROUTE_TRACES)
        .then(responseSuccessHandler)
        .catch(responseErrorHandler);
    }
  }, [isMounted.current]);

  return (
    <div className="mt40">
      {traces
        .map(transformTraceToEnhanced)
        .reduce(groupTracksByMonth, [])
        .sort(orderGroupByKeyAsc)
        .map(([key, { label, traces: items }]: GroupOfTraces) => (
          <TracesGroup key={key} label={label} traces={items} />
        ))}
    </div>
  );
};

export default TraceCardList;
