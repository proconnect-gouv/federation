import React from 'react';

import { CardComponent, Sizes } from '@fc/dsfr';
import { t } from '@fc/i18n';

import type { InstanceInterface } from '../../interfaces';

interface VersionComponentProps {
  item: InstanceInterface;
}

// @TODO rename to InstanceComponent
export const VersionComponent = React.memo(({ item }: VersionComponentProps) => {
  const date = t('CorePartners.version.createAt', { date: item.createdAt });

  return (
    <CardComponent
      enlargeLink
      details={{
        top: {
          className: 'fr-icon-arrow-right-line',
          content: date,
        },
      }}
      link={item.id}
      size={Sizes.LARGE}
      title={item.name}
    />
  );
});

VersionComponent.displayName = 'VersionComponent';
