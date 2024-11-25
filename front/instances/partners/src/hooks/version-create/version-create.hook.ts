import isEmpty from 'lodash.isempty';
import { useCallback } from 'react';
import { useNavigate, useRouteLoaderData } from 'react-router-dom';

import { VersionsService } from '@fc/core-partners';
import type { JSONFieldType } from '@fc/dto2form';
import { UNKNOWN_FORM_ERROR } from '@fc/forms';
import type { HttpClientDataInterface } from '@fc/http-client';

import { RouteLoaderDataIds } from '../../enums';

export const useVersionCreate = () => {
  const navigate = useNavigate();
  const schema = useRouteLoaderData(RouteLoaderDataIds.VERSION_SCHEMA) as JSONFieldType[];

  const submitHandler = useCallback(
    async (data: HttpClientDataInterface) => {
      const response = await VersionsService.create(data);

      const hasSubmissionErrors = !response || !isEmpty(response.payload);
      if (hasSubmissionErrors) {
        return (response && response.payload) || UNKNOWN_FORM_ERROR;
      }

      navigate('..', { replace: true, state: { submitSuccess: true } });
      return null;
    },
    [navigate],
  );

  return { schema, submitHandler };
};
