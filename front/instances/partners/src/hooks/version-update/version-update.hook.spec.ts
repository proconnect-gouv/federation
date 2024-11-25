import { renderHook } from '@testing-library/react';
import { useLoaderData, useNavigate, useParams, useRouteLoaderData } from 'react-router-dom';

import { type VersionInterface, VersionsService } from '@fc/core-partners';
import type { JSONFieldType } from '@fc/dto2form';
import type { HttpClientDataInterface } from '@fc/http-client';

import { useVersionUpdate } from './version-update.hook';

describe('useVersionUpdate', () => {
  // Given
  const navigateMock = jest.fn();
  const versionIdMock = 'any-version-id-mock';
  const paramsMock = { versionId: versionIdMock };
  const schemaMock = Symbol('schema-mock') as unknown as JSONFieldType[];
  const versionMock = Symbol('data-mock') as unknown as VersionInterface;
  const payloadMock = {
    name: 'any-name-mock',
    versions: [{ data: versionMock }],
  };

  beforeEach(() => {
    // Given
    jest.mocked(useNavigate).mockReturnValue(navigateMock);
    jest.mocked(useParams).mockReturnValue(paramsMock);
    jest.mocked(useLoaderData).mockReturnValue({ payload: payloadMock });
    jest.mocked(useRouteLoaderData).mockReturnValue(schemaMock);
  });

  it('should call hooks and return an object with initialValues, submitHandler, title, schema', () => {
    // When
    const { result } = renderHook(() => useVersionUpdate());

    // Then
    expect(result.current).toStrictEqual({
      initialValues: versionMock,
      schema: schemaMock,
      submitHandler: expect.any(Function),
      title: 'any-name-mock',
    });
    expect(useNavigate).toHaveBeenCalledOnce();
    expect(useNavigate).toHaveBeenCalledWith();
    expect(useParams).toHaveBeenCalledOnce();
    expect(useParams).toHaveBeenCalledWith();
    expect(useLoaderData).toHaveBeenCalledOnce();
    expect(useLoaderData).toHaveBeenCalledWith();
    expect(useRouteLoaderData).toHaveBeenCalledOnce();
    expect(useRouteLoaderData).toHaveBeenCalledWith('dto2form::version::shema');
  });

  describe('the submit function', () => {
    it('should call VersionsService.update with data when submit is called', async () => {
      // Given
      const dataMock = Symbol('data-mock') as unknown as HttpClientDataInterface;

      // When
      const { result } = renderHook(() => useVersionUpdate());
      await result.current.submitHandler(dataMock);

      // Then
      expect(VersionsService.update).toHaveBeenCalledOnce();
      expect(VersionsService.update).toHaveBeenCalledWith(dataMock, 'any-version-id-mock');
    });

    it('should return some submission errors from VersionsService.update response', async () => {
      // Given
      const submissionErrorsMock = [{ anyField: 'an-field-error' }];
      const dataMock = Symbol('data-mock') as unknown as HttpClientDataInterface;

      jest.mocked(VersionsService.update).mockResolvedValueOnce({ payload: submissionErrorsMock });

      // When
      const { result } = renderHook(() => useVersionUpdate());
      const errors = await result.current.submitHandler(dataMock);

      // Then
      expect(errors).toBe(submissionErrorsMock);
    });

    it('should return the generic form error when VersionsService.update response is not defined', async () => {
      // Given
      const dataMock = Symbol('data-mock') as unknown as HttpClientDataInterface;

      jest.mocked(VersionsService.update).mockResolvedValueOnce(undefined);

      // When
      const { result } = renderHook(() => useVersionUpdate());
      const errors = await result.current.submitHandler(dataMock);

      // Then
      // eslint-disable-next-line @typescript-eslint/naming-convention
      expect(errors).toStrictEqual({ 'FINAL_FORM/form-error': 'Form.FORM_ERROR' });
    });

    it('should call navigate if VersionsService.update is not returning any errors', async () => {
      // Given
      const dataMock = Symbol('data-mock') as unknown as HttpClientDataInterface;

      jest.mocked(VersionsService.update).mockResolvedValueOnce({ payload: undefined });

      // When
      const { result } = renderHook(() => useVersionUpdate());
      const errors = await result.current.submitHandler(dataMock);

      // Then
      expect(navigateMock).toHaveBeenCalledOnce();
      expect(navigateMock).toHaveBeenCalledWith('.', {
        replace: true,
        state: { submitSuccess: true },
      });
      expect(errors).toBeNull();
    });
  });
});
