import './user-preferences.scss';

import React from 'react';
import { Form } from 'react-final-form';

import { useUserPreferencesApi } from '../hooks';
import { UserPreferencesConfig } from '../interfaces';
import { UserPreferencesFormComponent } from './user-preferences-form.component';

interface UserPreferencesComponentProps {
  options: UserPreferencesConfig;
}

export const UserPreferencesComponent: React.FC<UserPreferencesComponentProps> = React.memo(
  ({ options }: UserPreferencesComponentProps) => {
    const { commit, formValues, identityProviders, submitWithSuccess } =
      useUserPreferencesApi(options);

    return (
      <Form initialValues={formValues} onSubmit={commit}>
        {({ dirty, handleSubmit, pristine: isSameAsInitialValues, submitting }) => {
          // @NOTE declarative function
          /* istanbul ignore next */
          const canNotSubmit = isSameAsInitialValues || submitting;
          const showNotification = !dirty && submitWithSuccess;
          return (
            <UserPreferencesFormComponent
              canNotSubmit={canNotSubmit}
              identityProviders={identityProviders}
              showNotification={showNotification}
              onSubmit={handleSubmit}
            />
          );
        }}
      </Form>
    );
  },
);

UserPreferencesComponent.displayName = 'UserPreferencesComponent';
