import { act, renderHook, waitFor } from '@testing-library/react';
import type { AxiosResponse } from 'axios';
import type { Location } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import { get } from '@fc/http-client';

import type { TracksConfig } from '../../interfaces';
import { DEFAULT_OFFSET, DEFAULT_SIZE, usePaginatedTracks } from './use-paginated-tracks.hook';

describe('usePaginatedTracks', () => {
  // Given
  const options = { API_ROUTE_TRACKS: 'tracks-route' } as TracksConfig;
  const tracksMock = ['tracks1', 'tracks2'];

  beforeEach(() => {
    // Given
    const response = { data: tracksMock } as unknown as AxiosResponse;
    jest.mocked(get).mockResolvedValue(response);
  });

  it('should return tracks with default params at first render', async () => {
    // When
    const { result } = renderHook(() => usePaginatedTracks(options));

    // Then
    await waitFor(() => {
      expect(result.current).toStrictEqual({
        submitErrors: undefined,
        tracks: tracksMock,
      });
      expect(get).toHaveBeenCalledOnce();
      expect(get).toHaveBeenCalledWith(
        `${options.API_ROUTE_TRACKS}?offset=${DEFAULT_OFFSET}&size=${DEFAULT_SIZE}`,
      );
    });
  });

  describe('should get tracks depends on query params', () => {
    it('should call get with formatted endpoint based on query params', async () => {
      // When
      renderHook(() => usePaginatedTracks(options));
      act(() => {
        jest.mocked(useLocation).mockReturnValueOnce({
          search: '?size=2&offset=30',
        } as Location);
      });

      // Then
      await waitFor(() => {
        expect(get).toHaveBeenCalledTimes(2);
        expect(get).toHaveBeenNthCalledWith(
          1,
          `${options.API_ROUTE_TRACKS}?offset=${DEFAULT_OFFSET}&size=${DEFAULT_SIZE}`,
        );
        expect(get).toHaveBeenNthCalledWith(2, `${options.API_ROUTE_TRACKS}?offset=30&size=2`);
      });
    });

    it('should resolve get and return tracks', async () => {
      // Given
      const mockTracksNextPageMock = ['foo', 'bar'];

      const response = { data: tracksMock } as unknown as AxiosResponse;
      const mockTracksNextPageResponseMock = {
        data: mockTracksNextPageMock,
      } as unknown as AxiosResponse;

      jest
        .mocked(get)
        .mockResolvedValueOnce(response)
        .mockResolvedValueOnce(mockTracksNextPageResponseMock);
      jest.mocked(useLocation).mockReturnValueOnce({
        search: '?size=2&offset=30',
      } as Location);

      // When
      const { result } = renderHook(() => usePaginatedTracks(options));

      // Then
      await waitFor(() => {
        expect(result.current).toStrictEqual({
          submitErrors: undefined,
          tracks: mockTracksNextPageMock,
        });
      });
    });

    it('should reject get and console.error', async () => {
      // Given
      const errorMock = new Error('error');
      jest.mocked(get).mockRejectedValueOnce(errorMock);

      // When
      const { result } = renderHook(() => usePaginatedTracks(options));

      // Then
      await waitFor(() => {
        expect(result.current).toStrictEqual({
          submitErrors: errorMock,
          tracks: {},
        });
      });
    });
  });
});
