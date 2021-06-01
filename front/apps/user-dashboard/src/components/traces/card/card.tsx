import './card.scss';

import { Collapse } from 'antd';
import classnames from 'classnames';
import React from 'react';

import CardContentAutorisation, {
  AUTHORISATION_LABEL_TYPE,
} from './card-content-autorisation';
import CardContentScopes from './card-content-scopes';
import CardHeader from './card-header';
import { CardInterface } from './card.interface';

function TraceCard({
  data,
  index,
  type,
  ...props
}: CardInterface): JSX.Element {
  const isConnexionType = type === AUTHORISATION_LABEL_TYPE;

  return (
    <Collapse.Panel
      {...props}
      key={String(index)}
      className={classnames(
        'border-bottom-0 rounded position-relative border-light is-blue-shadow custom-card-border use-pointer mb-5 cursor-pointer custom-animate-inner-icon'
      )}
      header={<CardHeader data={data} type={type} />}>
      {isConnexionType && <CardContentAutorisation data={data} type={type} />}
      {!isConnexionType && <CardContentScopes data={data} type={type} />}
    </Collapse.Panel>
  );
}

export default TraceCard;
