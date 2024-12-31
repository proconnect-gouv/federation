import { act, render } from '@testing-library/react';
import { DateTime } from 'luxon';
import React from 'react';
import * as ReactRouterDom from 'react-router-dom';

import { PaginationComponent } from '@fc/dsfr';

import type { TrackInterface } from '../../interfaces';
import { orderGroupByKeyAsc, transformTrackToEnhanced } from '../../utils';
import { TracksGroupComponent } from './tracks-group';
import { TracksListComponent } from './tracks-list.component';
import { usePaginatedTracks } from './use-paginated-tracks.hook';

jest.mock('./tracks-group');
jest.mock('./use-paginated-tracks.hook');
jest.mock('./../../utils/tracks.util');

const payloadMock = [
  {
    accountId: 'mock-accountId-1',
    city: 'mock-city-1',
    country: 'mock-country-1',
    date: '2021-10-05T14:48:00.000Z',
    datetime: DateTime.fromISO('2021-10-05T14:48:00.000Z'),
    event: 'mock-event-1',
    interactionAcr: 'mock-spacr-1',
    spId: 'mock-spid-1',
    spLabel: 'mock-splabel-1',
    trackId: 'mock-trackid-1',
  },
  {
    accountId: 'mock-accountId-2',
    city: 'mock-city-2',
    country: 'mock-country-2',
    date: '2021-11-05T14:48:00.000Z',
    datetime: DateTime.fromISO('2021-11-05T14:48:00.000Z'),
    event: 'mock-event-2',
    interactionAcr: 'mock-spacr-2',
    spId: 'mock-spid-2',
    spLabel: 'mock-splabel-2',
    trackId: 'mock-trackid-2',
  },
] as unknown as TrackInterface[];

const tracksMock = {
  meta: {
    offset: 0,
    size: 10,
    total: 100,
  },
  payload: payloadMock,
  type: 'application',
};

describe('TracksListComponent', () => {
  const usePaginatedTracksMock = jest.mocked(usePaginatedTracks);

  beforeEach(() => {
    usePaginatedTracksMock.mockReturnValue({ submitErrors: undefined, tracks: tracksMock });
  });

  const options = {
    API_ROUTE_TRACKS: 'mock_API_ROUTE_TRACKS',
    API_ROUTE_USER_INFOS: 'mock_API_ROUTE_USER_INFOS',
    LUXON_FORMAT_DATETIME_SHORT_FR: "D 'à' T",
    LUXON_FORMAT_DAY: 'DDD',
    LUXON_FORMAT_HOUR_MINS: 'T',
    LUXON_FORMAT_MONTH_YEAR: 'LLLL yyyy',
    LUXON_FORMAT_TIMEZONE: 'z',
  };

  it('should match snapshot', () => {
    // When
    const { container } = render(<TracksListComponent options={options} />);

    // Then
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot when data contains no tracks', () => {
    // Given
    const emptyTracksMock = {
      meta: {
        offset: 0,
        size: 10,
        total: 0,
      },

      payload: [],
      type: 'application',
    };
    usePaginatedTracksMock.mockReturnValue({ submitErrors: undefined, tracks: emptyTracksMock });
    // When
    const { container } = render(<TracksListComponent options={options} />);

    // Then
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot when tracks data are not defined', () => {
    // Given
    usePaginatedTracksMock.mockReturnValue({
      submitErrors: undefined,
      tracks: {
        type: 'application',
      },
    });

    // When
    const { container } = render(<TracksListComponent options={options} />);

    // Then
    expect(container).toMatchSnapshot();
  });

  it('should have called usePaginatedTracks hook', () => {
    // When
    render(<TracksListComponent options={options} />);

    // Then
    expect(usePaginatedTracksMock).toHaveBeenCalledOnce();
  });

  it('should filter out nullish entries', () => {
    // Given
    const nonNullish1 = Symbol('nonNullish1') as unknown as TrackInterface;
    const nonNullish2 = Symbol('nonNullish2') as unknown as TrackInterface;

    const tracksWithNullishEntries = {
      ...tracksMock,
      payload: [
        nonNullish1,
        false as unknown as TrackInterface,
        null as unknown as TrackInterface,
        nonNullish2,
        undefined as unknown as TrackInterface,
      ],
    };
    const filteredPayload = [nonNullish1, nonNullish2];

    usePaginatedTracksMock.mockReturnValue({
      submitErrors: undefined,
      tracks: tracksWithNullishEntries,
    });

    // When
    render(<TracksListComponent options={options} />);

    // Then
    expect(transformTrackToEnhanced).toHaveBeenNthCalledWith(1, nonNullish1, 0, filteredPayload);
    expect(transformTrackToEnhanced).toHaveBeenNthCalledWith(2, nonNullish2, 1, filteredPayload);
  });

  it('should have called transformTrackToEnhanced', () => {
    // When
    render(<TracksListComponent options={options} />);

    // Then
    expect(transformTrackToEnhanced).toHaveBeenNthCalledWith(1, payloadMock[0], 0, payloadMock);
    expect(transformTrackToEnhanced).toHaveBeenNthCalledWith(2, payloadMock[1], 1, payloadMock);
  });

  it('should have called orderGroupByKeyAsc', () => {
    // When
    render(<TracksListComponent options={options} />);

    // Then
    expect(orderGroupByKeyAsc).toHaveBeenCalledOnce();
  });

  it('should have called TracksGroupComponent', () => {
    // When
    render(<TracksListComponent options={options} />);

    // Then
    expect(TracksGroupComponent).toHaveBeenNthCalledWith(
      1,
      {
        label: 'Octobre 2021',
        options,
        tracks: [payloadMock[0]],
      },
      {},
    );
    expect(TracksGroupComponent).toHaveBeenNthCalledWith(
      2,
      {
        label: 'Novembre 2021',
        options,
        tracks: [payloadMock[1]],
      },
      {},
    );
  });

  it('should not display TracksGroupComponent if tracks does not exist', () => {
    // Given
    usePaginatedTracksMock.mockReturnValue({
      submitErrors: undefined,
      tracks: { ...tracksMock, payload: undefined },
    });

    // When
    render(<TracksListComponent options={options} />);

    // Then
    expect(transformTrackToEnhanced).not.toHaveBeenCalled();
    expect(orderGroupByKeyAsc).not.toHaveBeenCalled();
    expect(TracksGroupComponent).not.toHaveBeenCalled();
  });

  it('should redirect to new location', () => {
    // Given
    const indexMock = 20;
    const navigateFuncMock = jest.fn();
    const useCallbackMock = jest.spyOn(React, 'useCallback').mockImplementation(() => jest.fn());
    jest.spyOn(ReactRouterDom, 'useNavigate').mockImplementationOnce(() => navigateFuncMock);
    jest.mocked(PaginationComponent).mockImplementation(() => (
      <button type="button" onClick={() => useCallbackMock}>
        foo
      </button>
    ));

    // When
    render(<TracksListComponent options={options} />);
    const callback = useCallbackMock.mock.calls[0][0];
    act(() => {
      callback(indexMock);
    });

    // Then
    expect(navigateFuncMock).toHaveBeenCalledOnce();
  });
});
