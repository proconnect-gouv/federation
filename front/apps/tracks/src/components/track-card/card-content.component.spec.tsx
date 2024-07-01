import { render } from '@testing-library/react';
import { DateTime } from 'luxon';

import { CinematicEvents } from '../../enums';
import type { IRichClaim } from '../../interfaces';
import { TrackCardContentComponent } from './card-content.component';
import { ClaimsComponent } from './claims.component';
import { ConnectionComponent } from './connection.component';

jest.mock('./connection.component');
jest.mock('./claims.component');

describe('TrackCardContentComponent', () => {
  const claims1: IRichClaim = {
    identifier: 'claims1',
    label: 'Claims 1 Label',
    provider: {
      label: 'Provider 1 label',
      slug: 'provider1_key',
    },
  };

  const claims2: IRichClaim = {
    identifier: 'claims2',
    label: 'Claims 2 Label',
    provider: {
      label: 'Provider 1 label',
      slug: 'provider1_key',
    },
  };

  const claimsMock = [claims1, claims2];
  const date = DateTime.fromObject(
    { day: 1, hour: 6, minute: 32, month: 10, year: 2021 },
    { zone: 'Europe/Paris' },
  );

  const options = {
    API_ROUTE_TRACKS: 'mock_API_ROUTE_TRACKS',
    API_ROUTE_USER_INFOS: 'mock_API_ROUTE_USER_INFOS',
    LUXON_FORMAT_DATETIME_SHORT_FR: "D 'à' T",
    LUXON_FORMAT_DAY: 'DDD',
    LUXON_FORMAT_HOUR_MINS: 'T',
    LUXON_FORMAT_MONTH_YEAR: 'LLLL yyyy',
    LUXON_FORMAT_TIMEZONE: 'z',
  };

  it('should match snapshot, for connection', () => {
    // when
    const { container } = render(
      <TrackCardContentComponent
        accessibleId="mock-accessibleId"
        city="cityMock"
        claims={claimsMock}
        country="countryMock"
        datetime={date}
        eventType={CinematicEvents.FC_VERIFIED}
        idpLabel="idpLabelValue"
        interactionAcr="eidas1"
        opened={false}
        options={options}
      />,
    );

    // then
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot, for claims', () => {
    // when
    const { container } = render(
      <TrackCardContentComponent
        accessibleId="mock-accessibleId"
        city="cityMock"
        claims={claimsMock}
        country="countryMock"
        datetime={date}
        eventType={CinematicEvents.DP_VERIFIED_FC_CHECKTOKEN}
        idpLabel="idpLabelValue"
        interactionAcr="eidas1"
        opened={false}
        options={options}
      />,
    );

    // then
    expect(container).toMatchSnapshot();
  });

  it('should display ConnectionComponent and not ClaimsComponent', () => {
    // Given
    const eventType = 'FC_VERIFIED' as CinematicEvents;

    // When
    render(
      <TrackCardContentComponent
        accessibleId="mock-accessibleId"
        city="cityMock"
        claims={claimsMock}
        country="countryMock"
        datetime={date}
        eventType={eventType}
        idpLabel="idpLabelValue"
        interactionAcr="eidas1"
        opened={false}
        options={options}
      />,
    );

    // Then
    expect(ConnectionComponent).toHaveBeenCalledOnce();

    expect(ConnectionComponent).toHaveBeenCalledWith(
      {
        city: 'cityMock',
        country: 'countryMock',
        datetime: date,
        idpLabel: 'idpLabelValue',
        interactionAcr: 'eidas1',
        options,
      },
      {},
    );
  });

  it('should display ClaimsComponent and not ConnectionComponent', () => {
    // Given
    const eventType = 'FC_DATATRANSFER_CONSENT_IDENTITY' as CinematicEvents;

    // When
    render(
      <TrackCardContentComponent
        accessibleId="mock-accessibleId"
        city="cityMock"
        claims={claimsMock}
        country="countryMock"
        datetime={date}
        eventType={eventType}
        idpLabel="idpLabelValue"
        interactionAcr="eidas1"
        opened={false}
        options={options}
      />,
    );

    // Then
    expect(ClaimsComponent).toHaveBeenCalledOnce();

    expect(ClaimsComponent).toHaveBeenCalledWith(
      {
        claims: claimsMock,
        datetime: date,
        eventType,
        options,
      },
      {},
    );
  });
});
