import classnames from 'classnames';
import React, { useCallback, useState } from 'react';
import { createUseStyles } from 'react-jss';

import { EnhancedTrace } from '../types';
import CardBadge from './card-badge';
import CardContent from './card-content';
import CardHeader from './card-header';

const useStyles = createUseStyles({
  card: {
    '&:focus, &:hover': {
      border: '2px #2183f0 solid',
      outline: '2px transparent solid',
    },
    background: '#FFFFFF',
    border: '2px transparent solid',
    borderRadius: 4,
    tansitionProperty: 'border-color',
    transitionDuration: '0.2s',
  },
  details: {},
});

type TraceCardProps = {
  trace: EnhancedTrace;
};

const TraceCardComponent = React.memo(({ trace }: TraceCardProps) => {
  const classes = useStyles();
  const [opened, setOpened] = useState(false);

  const openCardHandler = useCallback(() => {
    const next = !opened;
    setOpened(next);
  }, [opened]);

  const { accountId, datetime, event, spAcr, spName, trackId } = trace;

  const cardA11YId = `card::a11y::${trackId}`;
  return (
    <button
      aria-controls={cardA11YId}
      aria-expanded={opened}
      className={classnames(
        classes.card,
        'use-pointer is-full-width text-left is-block is-relative is-blue-shadow mb32 px20 py16',
      )}
      type="button"
      onClick={openCardHandler}>
      <CardBadge type={event} />
      <CardHeader
        datetime={datetime}
        identityProviderName={spName}
        opened={opened}
      />
      <CardContent
        accessibleId={cardA11YId}
        accountId={accountId}
        datetime={datetime}
        opened={opened}
        spAcr={spAcr}
      />
    </button>
  );
});

TraceCardComponent.displayName = 'TraceCardComponent';

export default TraceCardComponent;
