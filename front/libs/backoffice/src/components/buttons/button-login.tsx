import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { loadGetAuthorizeUrl, RootState } from '@fc/oidc-client';

import './button-login.scss';

export const LoginButtonComponent = () => {
  const dispatch = useDispatch();
  const isMounted = useRef(false);

  const authorizeUrl = useSelector((_: RootState) => _.authorizeUrl);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;

      const action = loadGetAuthorizeUrl();
      dispatch(action);
    }
  }, [isMounted, dispatch]);

  return (
    <a
      className="LoginButtonComponent fs18 p12"
      href={authorizeUrl}
      title="Se connecter"
    >
      <span>Se connecter</span>
    </a>
  );
};

LoginButtonComponent.displayName = 'LoginButtonComponent';
