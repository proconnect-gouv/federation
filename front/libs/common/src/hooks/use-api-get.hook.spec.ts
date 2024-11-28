import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { useApiGet } from './use-api-get.hook';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn().mockReturnValue(jest.fn()),
}));

describe('useApiGet', () => {
  const axiosGetMock = jest.mocked(axios.get);

  const useNavigateMock = jest.mocked(useNavigate);
  const navigateMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    axiosGetMock.mockResolvedValue({ data: 'any-data-response' });
    useNavigateMock.mockReturnValue(navigateMock);
  });

  it('should have return default state at first render', async () => {
    axiosGetMock.mockResolvedValueOnce(undefined);

    // when
    const { result } = renderHook(() => useApiGet({ endpoint: 'any-url' }));

    // then
    await waitFor(() => {
      expect(result.current).toBeUndefined();
    });
  });

  it('should have called axios.get at first render only', async () => {
    // when
    const { rerender, result } = renderHook(() => useApiGet({ endpoint: 'any-url' }));
    // @NOTE excessive renders only for tests purpose
    rerender();
    rerender();
    rerender();
    rerender();

    // then
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledOnce();
      expect(axios.get).toHaveBeenCalledWith('any-url');
      expect(result.current).toBe('any-data-response');
    });
  });

  it('should have called optional callback with api response', async () => {
    // given
    const callbackMock = jest.fn();

    // when
    renderHook(() => useApiGet({ endpoint: 'any-url' }, callbackMock));

    // then
    await waitFor(() => {
      expect(callbackMock).toHaveBeenCalledOnce();
      expect(callbackMock).toHaveBeenCalledWith('any-data-response');
    });
  });

  it('should navigate if an error is thrown and errorPath is provided', async () => {
    // given
    axiosGetMock.mockRejectedValueOnce(new Error('any-error'));
    const callbackMock = jest.fn();

    // when
    renderHook(() => useApiGet({ endpoint: 'any-url', errorPath: '/some/path' }, callbackMock));

    // then
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledOnce();
      expect(navigateMock).toHaveBeenCalledWith('/some/path', { replace: true });
    });
  });

  it('should NOT navigate if an error is thrown but errorPath is not provided', async () => {
    // given
    axiosGetMock.mockRejectedValueOnce(new Error('any-error'));
    const callbackMock = jest.fn();

    // when
    renderHook(() => useApiGet({ endpoint: 'any-url' }, callbackMock));

    // then
    await waitFor(() => {
      expect(navigateMock).not.toHaveBeenCalled();
    });
  });

  it('should NOT use callback if an error is thrown', async () => {
    // given
    axiosGetMock.mockRejectedValueOnce(new Error('any-error'));
    const callbackMock = jest.fn();

    // when
    renderHook(() => useApiGet({ endpoint: 'any-url' }, callbackMock));

    // then
    await waitFor(() => {
      expect(callbackMock).not.toHaveBeenCalled();
    });
  });
});
