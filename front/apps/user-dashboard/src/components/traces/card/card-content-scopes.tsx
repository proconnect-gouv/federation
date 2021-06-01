import get from 'lodash.get';
import React from 'react';
import slugify from 'slugify';

import { CardInterfaceBase } from './card.interface';

const TITLE_MAP = {
  autorisation: 'Vous avez accordé la récupération des données suivantes',
  'echange-de-donnees': 'Le service a récupéré les données suivantes',
};

function getTitleByType(type: string): string {
  const slugified = slugify(type);
  const title = get(TITLE_MAP, slugified, '');
  return title;
}

function CardContentScopesComponent({
  data,
  type,
}: CardInterfaceBase): JSX.Element {
  const title = getTitleByType(type);
  const { list = [] } = data || {};
  return (
    <React.Fragment>
      <span className="text-charcoal h6 mb-3 d-block">{title}</span>
      <ul className="pl-3">
        {list.map(item => (
          <li key={data.id} className="h6 mb-2">
            <strong>{item}</strong>
          </li>
        ))}
      </ul>
    </React.Fragment>
  );
}

export default CardContentScopesComponent;
