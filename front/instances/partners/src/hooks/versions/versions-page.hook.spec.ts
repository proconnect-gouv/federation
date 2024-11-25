import { renderHook } from '@testing-library/react';
import { useLoaderData } from 'react-router-dom';

import { useVersions } from './versions-page.hook';

describe('useVersions', () => {
  it('should return hasItems as true when payload has items', () => {
    // Given
    jest.mocked(useLoaderData).mockReturnValueOnce({
      payload: [expect.any(Object), expect.any(Object)],
    });

    // When
    const { result } = renderHook(() => useVersions());

    // Then
    expect(result.current).toEqual({
      hasItems: true,
      items: [expect.any(Object), expect.any(Object)],
    });
  });

  it('should return hasItems as false when payload has not items', () => {
    // Given
    jest.mocked(useLoaderData).mockReturnValueOnce({ payload: null });

    // When
    const { result } = renderHook(() => useVersions());

    // Then
    expect(result.current).toEqual({ hasItems: false, items: null });
  });
});
