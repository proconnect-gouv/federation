import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

import { useApiGet } from '@fc/common';

import { FormValues, Service, UserPreferencesConfig } from '../interfaces';
import { UserPreferencesService } from '../services';

export const useUserPreferencesApi = (options: UserPreferencesConfig) => {
  const identityProviders: Service[] | undefined = useApiGet({
    endpoint: options.API_ROUTE_USER_PREFERENCES,
  });

  const [submitErrors, setSubmitErrors] = useState(undefined);
  const [submitWithSuccess, setSubmitWithSuccess] = useState(false);
  const [formValues, setFormValues] = useState<FormValues | undefined>(undefined);

  const commitErrorHandler = useCallback((err) => {
    setSubmitErrors(err);
    setSubmitWithSuccess(false);
  }, []);

  const commitSuccessHandler = useCallback(({ data }) => {
    const values = UserPreferencesService.parseFormData(data);
    setFormValues(values);
    setSubmitErrors(undefined);
    setSubmitWithSuccess(true);
  }, []);

  const commit = useCallback(
    ({ allowFutureIdp, idpList }) => {
      const data = UserPreferencesService.encodeFormData({
        allowFutureIdp,
        idpList,
      });
      return axios
        .post(options.API_ROUTE_USER_PREFERENCES, data)
        .then(commitSuccessHandler)
        .catch(commitErrorHandler);
    },
    [commitSuccessHandler, commitErrorHandler, options.API_ROUTE_USER_PREFERENCES],
  );

  useEffect(() => {
    if (identityProviders && !formValues) {
      const values = UserPreferencesService.parseFormData(identityProviders);
      setFormValues(values);
    }
  }, [identityProviders, formValues]);

  return { commit, formValues, identityProviders, submitErrors, submitWithSuccess };
};
