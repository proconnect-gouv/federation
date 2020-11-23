/* istanbul ignore file */
// untested dette
import React, { ReactElement, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { loadMinistries } from '../../redux/actions';
import { RootState } from '../../types';
import Loader from './loader';

type AgentConnectContextProps = {
  children: ReactElement;
};

const AgentConnectContext = ({
  children,
}: AgentConnectContextProps): JSX.Element => {
  const dispatch = useDispatch();
  const ministries = useSelector((state: RootState) => state.ministries);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
      dispatch(loadMinistries());
    }
  }, [isMounted, dispatch]);

  const hasMinistryItems = ministries?.length > 0;
  const shouldShowLoader = !isMounted || !hasMinistryItems;

  return (
    <React.Fragment>
      {shouldShowLoader && <Loader />}
      {!shouldShowLoader && children}
    </React.Fragment>
  );
};

export default AgentConnectContext;
