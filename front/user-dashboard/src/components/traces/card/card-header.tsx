import './card-header.scss';

import classnames from 'classnames';
import { DateTime } from 'luxon';
import React from 'react';

import { CardInterfaceBase } from './card.interface';

const getBadgeColorClassname = (color: string): string => {
  switch (color) {
    case 'connexion':
      return 'badge-blue-cornflower';
    case 'autorisation':
      return 'badge-green-shamrock';
    case 'échange de données':
      return 'badge-orange-tacao';
    default:
      return 'badge-primary';
  }
};

function CardHeaderComponent({ data, type }: CardInterfaceBase): JSX.Element {
  const { date, title } = data;
  const formatedDate = DateTime.fromJSDate(date).toFormat('DDD');
  return (
    <React.Fragment>
      <div
        className={classnames(
          'badge custom-badge text-white p-2 rounded-sm font-weight-bold text-uppercase position-absolute d-flex align-items-center h5 justify-content-center t-0 h30 ',
          getBadgeColorClassname(type)
        )}>
        {type}
      </div>
      <div className="mb-1">
        <span className="text-charcoal h6">{formatedDate}</span>
      </div>
      <h5 className="text-primary font-weight-bold h5 w-75">
        <span>{title}</span>
      </h5>
    </React.Fragment>
  );
}

export default CardHeaderComponent;
