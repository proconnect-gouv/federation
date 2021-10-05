import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { loadGetEndSessionUrl, RootState } from '@fc/oidc-client';

import './button-logout.scss';

export const LogoutButtonComponent = () => {
  const dispatch = useDispatch();
  const isMounted = useRef(false);

  const endSessionUrl = useSelector((_: RootState) => _.endSessionUrl);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;

      const actionEndSessionUrl = loadGetEndSessionUrl();
      dispatch(actionEndSessionUrl);
    }
  }, [isMounted, dispatch]);

  return (
    <a
      className="LogoutButtonComponent fs18 p12"
      href={endSessionUrl}
      title="Se déconnecter"
    >
      <span>Se déconnecter</span>
    </a>
  );
};

LogoutButtonComponent.displayName = 'LogoutButtonComponent';
