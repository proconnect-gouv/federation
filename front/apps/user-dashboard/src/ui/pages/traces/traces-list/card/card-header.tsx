import { DateTime } from 'luxon';
import React from 'react';
import {
  AiOutlineMinus as MinusIcon,
  AiOutlinePlus as PlusIcon,
} from 'react-icons/ai';

import { LUXON_FORMAT_DAY } from '../../../../../configs/constants';

type TraceCardHeaderProps = {
  datetime: DateTime;
  identityProviderName: string;
  opened: boolean;
};

const TraceCardHeaderComponent = React.memo(
  ({ datetime, identityProviderName, opened }: TraceCardHeaderProps) => {
    const formattedDay = datetime.toFormat(LUXON_FORMAT_DAY);
    return (
      <div className="pt12 flex-columns flex-between items-center">
        <div>
          <div className="is-dark-grey fr-text-xs mb4">{formattedDay}</div>
          <div className="is-blue-france fr-text-lg">
            <b>{identityProviderName}</b>
          </div>
        </div>
        <div>
          {opened && <MinusIcon color="#034ea2" size={30} />}
          {!opened && <PlusIcon color="#034ea2" size={30} />}
        </div>
      </div>
    );
  },
);

TraceCardHeaderComponent.displayName = 'TraceCardHeaderComponent';

export default TraceCardHeaderComponent;
