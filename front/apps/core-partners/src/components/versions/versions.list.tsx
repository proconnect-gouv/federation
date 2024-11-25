import React from 'react';

import type { InstanceInterface } from '../../interfaces';
import { VersionComponent } from '../version';

interface VersionsListComponentProps {
  items: InstanceInterface[];
}

// @TODO rename to InstancesListComponent
export const VersionsListComponent = React.memo(({ items }: VersionsListComponentProps) => (
  <div className="fr-col-12">
    {items.map((item) => {
      const uniqkey = `version::${item.id}`;
      // @TODO rename to InstanceComponent
      return <VersionComponent key={uniqkey} item={item} />;
    })}
  </div>
));

VersionsListComponent.displayName = 'VersionsListComponent';
