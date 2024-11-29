import isEmpty from 'lodash.isempty';
import { useCallback } from 'react';
import { useLoaderData, useNavigate, useParams, useRouteLoaderData } from 'react-router-dom';

import type { InstanceInterface, ResponseInterface } from '@fc/core-partners';
import { VersionsService } from '@fc/core-partners';
import type { JSONFieldType } from '@fc/dto2form';
import { UNKNOWN_FORM_ERROR } from '@fc/forms';
import type { HttpClientDataInterface } from '@fc/http-client';

import { RouteLoaderDataIds, SubmitTypes, SubmitTypesMessage } from '../../enums';

export const useVersionUpdate = () => {
  const navigate = useNavigate();
  const { versionId } = useParams() as { versionId: string };
  const { payload } = useLoaderData() as ResponseInterface<InstanceInterface>;
  const schema = useRouteLoaderData(RouteLoaderDataIds.VERSION_SCHEMA) as JSONFieldType[];

  const title = payload.name;
  const initialValues = payload.versions[0].data;

  const submitHandler = useCallback(
    async (data: HttpClientDataInterface) => {
      const response = await VersionsService.update(data, versionId);

      const hasSubmissionErrors = !response || !isEmpty(response.payload);
      if (hasSubmissionErrors) {
        return (response && response.payload) || UNKNOWN_FORM_ERROR;
      }

      const submitState = {
        message: SubmitTypesMessage.INSTANCE_SUCCESS_UPDATE,
        type: SubmitTypes.SUCCESS,
      };

      navigate('..', { replace: true, state: { submitState } });
      return null;
    },
    [navigate, versionId],
  );

  return { initialValues, schema, submitHandler, title };
};
