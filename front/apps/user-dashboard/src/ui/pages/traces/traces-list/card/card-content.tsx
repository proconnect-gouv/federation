import classnames from 'classnames';
import { DateTime } from 'luxon';
import React from 'react';
import { createUseStyles } from 'react-jss';

import {
  LUXON_FORMAT_HOUR_MINS,
  LUXON_FORMAT_TIMEZONE,
} from '../../../../../configs/constants';

const useStyles = createUseStyles({
  card: {
    '&:hover': { border: '2px #2183f0 solid' },
    background: '#FFFFFF',
    border: '2px transparent solid',
    borderRadius: 4,
  },
  details: {},
});

type TraceCardContentProps = {
  accessibleId: string;
  accountId: string;
  datetime: DateTime;
  opened: boolean;
  spAcr: string;
};

const TraceCardContentComponent = React.memo(
  ({
    accessibleId,
    accountId,
    datetime,
    opened,
    spAcr,
  }: TraceCardContentProps) => {
    const classes = useStyles();

    const formattedTime = datetime.toFormat(LUXON_FORMAT_HOUR_MINS);
    const formattedLocation = datetime.toFormat(LUXON_FORMAT_TIMEZONE);

    return (
      <dl
        aria-hidden={!opened}
        className={classnames(classes.details, 'fr-text', {
          mt16: opened,
          'no-display': !opened,
        })}
        id={accessibleId}
        role="region"
        tabIndex={-1}>
        <dt className="mb12">
          <span>Le service a récupéré les données suivantes</span>
        </dt>
        <dd className="ml32">
          <ul>
            <li>
              <span>Heure&nbsp;:&nbsp;</span>
              <b>{formattedTime} (heure de Paris)</b>
            </li>
            <li>
              <span>Localisation&nbsp;:&nbsp;</span>
              <b>{formattedLocation}</b>
            </li>
            <li>
              <span>Compte Utilisé&nbsp;:&nbsp;</span>
              <b>{accountId}</b>
            </li>
            <li>
              <span>Niveau de sécurité&nbsp;:&nbsp;</span>
              <a
                className="is-g700"
                href="/"
                title={`En savoir plus sur le niveau de sécurité ${spAcr}`}>
                <b>{spAcr}</b>
              </a>
            </li>
          </ul>
        </dd>
      </dl>
    );
  },
);

TraceCardContentComponent.displayName = 'TraceCardContentComponent';

export default TraceCardContentComponent;
