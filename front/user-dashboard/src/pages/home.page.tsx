import React, { useCallback } from 'react';
import { Form } from 'react-final-form';

import { HiddenInput } from '~components/form-inputs';

function HomePage(): JSX.Element {
  const initialValues = {
    acr_values: 'eidas2',
    client_id:
      '6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39950',
    redirect_uri: 'https://fsp1v2.docker.dev-franceconnect.fr/login-callback',
    response_type: 'code',
    scope:
      'openid gender birthdate birthcountry birthplace given_name family_name email preferred_username address phone',
    state: '<%= state %>',
  };

  const onSubmitHandler = useCallback(() => {}, []);

  return (
    <div className="container mt-5">
      <div className="text-center text-danger">
        Vous devez vous authentifier afin d&apos;accéder à vos données
        personnelles.
      </div>
      <Form
        initialValues={initialValues}
        render={({ handleSubmit, submitting }) => (
          <form className="text-center" onSubmit={handleSubmit}>
            <HiddenInput name="client_id" />
            <HiddenInput name="scope" />
            <HiddenInput name="code" />
            <HiddenInput name="redirect_uri" />
            <HiddenInput name="state" />
            <HiddenInput name="acr_values" />
            <button className="btn" disabled={submitting} type="submit">
              <img
                alt="Connexion FC"
                className="d-inline-block align-top"
                src="/img/FCboutons-10.svg"
              />
            </button>
          </form>
        )}
        onSubmit={onSubmitHandler}
      />
    </div>
  );
}

export default HomePage;
