import { renderHook } from '@testing-library/react';
import { useNavigate, useRouteLoaderData } from 'react-router-dom';

import { VersionsService } from '@fc/core-partners';
import type { JSONFieldType } from '@fc/dto2form';
import type { HttpClientDataInterface } from '@fc/http-client';

import { useVersionCreate } from './version-create.hook';

describe('useVersionCreate', () => {
  // Given
  const navigateMock = jest.fn();
  const dataMock = Symbol('data-mock') as unknown as HttpClientDataInterface;
  const schemaMock = Symbol('schema-mock') as unknown as JSONFieldType[];

  beforeEach(() => {
    // Given
    jest.mocked(useNavigate).mockReturnValue(navigateMock);
    jest.mocked(useRouteLoaderData).mockReturnValue(schemaMock);
  });

  it('should call hooks and return an object with initialValues, submitHandler, title, schema', () => {
    // When
    const { result } = renderHook(() => useVersionCreate());

    // Then
    expect(result.current).toStrictEqual({
      schema: schemaMock,
      submitHandler: expect.any(Function),
    });
    expect(useNavigate).toHaveBeenCalledOnce();
    expect(useNavigate).toHaveBeenCalledWith();
    expect(useRouteLoaderData).toHaveBeenCalledOnce();
    expect(useRouteLoaderData).toHaveBeenCalledWith('dto2form::version::shema');
  });

  describe('the submit function', () => {
    it('should call VersionsService.create with data when submit is called', async () => {
      // When
      const { result } = renderHook(() => useVersionCreate());
      await result.current.submitHandler(dataMock);

      // Then
      expect(VersionsService.create).toHaveBeenCalledOnce();
      expect(VersionsService.create).toHaveBeenCalledWith(dataMock);
    });

    it('should return some submission errors from VersionsService.create response', async () => {
      // Given
      const submissionErrorsMock = [{ anyField: 'an-field-error' }];

      jest.mocked(VersionsService.create).mockResolvedValueOnce({ payload: submissionErrorsMock });

      // When
      const { result } = renderHook(() => useVersionCreate());
      const errors = await result.current.submitHandler(dataMock);

      // Then
      expect(errors).toBe(submissionErrorsMock);
    });

    it('should return the generic form error when VersionsService.create response is not defined', async () => {
      // Given
      jest.mocked(VersionsService.create).mockResolvedValueOnce(undefined);

      // When
      const { result } = renderHook(() => useVersionCreate());
      const errors = await result.current.submitHandler(dataMock);

      // Then
      // eslint-disable-next-line @typescript-eslint/naming-convention
      expect(errors).toStrictEqual({ 'FINAL_FORM/form-error': 'Form.FORM_ERROR' });
    });

    it('should call navigate if VersionsService.create is not returning any errors', async () => {
      // Given
      jest.mocked(VersionsService.create).mockResolvedValueOnce({ payload: undefined });

      // When
      const { result } = renderHook(() => useVersionCreate());
      const errors = await result.current.submitHandler(dataMock);

      // Then
      expect(navigateMock).toHaveBeenCalledOnce();
      expect(navigateMock).toHaveBeenCalledWith('..', {
        replace: true,
        state: { submitSuccess: true },
      });
      expect(errors).toBeNull();
    });
  });
});
