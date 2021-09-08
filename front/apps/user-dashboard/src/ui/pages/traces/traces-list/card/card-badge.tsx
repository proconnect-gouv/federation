import classnames from 'classnames';
import React from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  badge: {
    borderRadius: 4,
    color: '#FFFFFF',
    left: 20,
    top: -16,
  },
});

const BADGE_CONFIG = {
  FC_REQUESTED_IDP_USERINFO: {
    backgroundColor: '#66a1e4',
    label: 'Connexion',
  },
  SP_REQUESTED_FC_USERINFO: {
    backgroundColor: '#40d496',
    label: 'Autorisation',
  },
  not_relevant_event: {
    backgroundColor: '#f4a381',
    label: 'Échange de Données',
  },
} as any;

type TraceCardBadgeProps = {
  type: string;
};

const TraceCardBadgeComponent = React.memo(({ type }: TraceCardBadgeProps) => {
  const classes = useStyles();
  const { backgroundColor, label } = BADGE_CONFIG[type];
  return (
    <div
      className={classnames(
        classes.badge,
        'is-absolute is-uppercase fr-text-xs py8 px12',
      )}
      style={{ backgroundColor }}>
      <b>{label}</b>
    </div>
  );
});

TraceCardBadgeComponent.displayName = 'TraceCardBadgeComponent';

export default TraceCardBadgeComponent;
