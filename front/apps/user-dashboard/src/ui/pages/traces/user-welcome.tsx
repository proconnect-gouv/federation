import axios from 'axios';
import classnames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';

import { API_ROUTE_USER_INFOS } from '../../../configs/constants';

const useStyles = createUseStyles({
  welcome: {
    backgroundColor: '#FFFFFF', // accessibility purpose
  },
});

const UserWelcomeComponent = () => {
  const classes = useStyles();

  const isMounted = useRef(false);
  const [userInfos, setUserInfos] = useState({
    familyName: '',
    givenName: '',
  });

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      axios({
        method: 'get',
        url: API_ROUTE_USER_INFOS,
      }).then(response => {
        setUserInfos(response.data.userInfos);
      });
    }
  }, [isMounted.current]);

  return (
    <section
      className={classnames(
        classes.welcome,
        'text-center is-blue-france mb40',
      )}>
      <h4>Bienvenue</h4>
      <h2>
        <b>
          {userInfos.givenName} {userInfos.familyName}
        </b>
      </h2>
    </section>
  );
};

UserWelcomeComponent.displayName = 'UserWelcomeComponent';

export default UserWelcomeComponent;
