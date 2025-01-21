import React from 'react';

import { sortByKey, SortOrder } from '@fc/common';

import type { InstanceInterface } from '../../interfaces';
import { InstanceComponent } from '../instance';

interface InstancesListComponentProps {
  items: InstanceInterface[];
}

export const InstancesListComponent = React.memo(({ items }: InstancesListComponentProps) => (
  <div className="fr-col-12">
    {items.sort(sortByKey('updatedAt', SortOrder.DESC)).map((item) => {
      const uniqkey = `instance::${item.id}`;
      return <InstanceComponent key={uniqkey} item={item} />;
    })}
  </div>
));

InstancesListComponent.displayName = 'InstancesListComponent';
