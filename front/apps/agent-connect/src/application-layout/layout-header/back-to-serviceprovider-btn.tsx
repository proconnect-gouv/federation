import axios from 'axios';
import classnames from 'classnames';
import queryString from 'query-string';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RiArrowGoBackFill as BackIcon } from 'react-icons/ri';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  button: {
    '&:hover > i': { border: '1px solid #2d91fc' },
    fontSize: 14,
  },
  icon: {
    border: '1px solid #3e4553',
    borderRadius: 4,
    padding: '0 5px 3px 5px',
  },
});

const BackToServiceProviderButton = () => {
  const mounted = useRef(false);

  const classes = useStyles();
  const [showButton, setShowButton] = useState(false);
  const [historyBackURL, setHistoryBackURL] = useState('');
  const [serviceProviderName, setServiceProviderName] = useState(null);

  const errorHandler = useCallback(() => {
    setShowButton(false);
  }, []);

  const responseHandler = useCallback(({ data }) => {
    const { redirectURI, redirectURIQuery, spName } = data;
    const query = queryString.stringify(redirectURIQuery);
    const nextHistoryBackURL = `${redirectURI}?${query}`;
    setHistoryBackURL(nextHistoryBackURL);
    setServiceProviderName(spName);
    setShowButton(true);
  }, []);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      const url = '/api/v2/history-back-url';
      axios.get(url).then(responseHandler).catch(errorHandler);
    }
  });

  if (!showButton) {
    return <span />;
  }
  return (
    <a
      className={classnames(
        classes.button,
        'flex-columns items-center no-underline',
      )}
      href={historyBackURL}
      title="retourner à l'écran précédent">
      <i className={classnames(classes.icon, 'is-block mr8')}>
        <BackIcon />
      </i>
      <span>Revenir sur {serviceProviderName}</span>
    </a>
  );
};

BackToServiceProviderButton.displayName = 'BackToServiceProviderButton';

export default BackToServiceProviderButton;
