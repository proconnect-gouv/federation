import { renderHook } from '@testing-library/react';
import { useNavigate, useRouteLoaderData } from 'react-router-dom';

import type { JSONFieldType } from '@fc/dto2form';
import type { HttpClientDataInterface } from '@fc/http-client';

import { InstancesService } from '../../services';
import { useInstanceCreate } from './instance-create.hook';

// Given
jest.mock('./../../services');

describe('useInstanceCreate', () => {
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
    const { result } = renderHook(() => useInstanceCreate());

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

  describe('The submit function', () => {
    it('should call InstancesService.create with data when submit is called', async () => {
      // When
      const { result } = renderHook(() => useInstanceCreate());
      await result.current.submitHandler(dataMock);

      // Then
      expect(InstancesService.create).toHaveBeenCalledOnce();
      expect(InstancesService.create).toHaveBeenCalledWith(dataMock);
    });

    it('should return some submission errors from InstancesService.create response', async () => {
      // Given
      const submissionErrorsMock = {
        anyFieldMock1: ['any-field-error-1'],
        anyFieldMock2: 'any-field-error-2',
        anyFieldMock3: 'any-field-error-3',
      };

      jest.mocked(InstancesService.create).mockResolvedValueOnce(submissionErrorsMock);

      // When
      const { result } = renderHook(() => useInstanceCreate());
      const errors = await result.current.submitHandler(dataMock);

      // Then
      expect(errors).toStrictEqual({
        anyFieldMock1: ['any-field-error-1'],
        anyFieldMock2: 'any-field-error-2',
        anyFieldMock3: 'any-field-error-3',
      });
    });

    it('should call navigate if InstancesService.create is not returning any errors', async () => {
      // Given
      jest.mocked(InstancesService.create).mockResolvedValueOnce(undefined);

      // When
      const { result } = renderHook(() => useInstanceCreate());
      const errors = await result.current.submitHandler(dataMock);

      // Then
      expect(navigateMock).toHaveBeenCalledOnce();
      expect(navigateMock).toHaveBeenCalledWith('..', {
        replace: true,
        state: {
          submitState: {
            message: 'Partners.instance.successCreate',
            type: 'success',
          },
        },
      });
      expect(errors).toBeNull();
    });
  });
});
