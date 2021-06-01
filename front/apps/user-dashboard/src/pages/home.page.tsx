import React from 'react';

function HomePage(): JSX.Element {
  const initialValues = {
    scope:
      'openid gender birthdate birthcountry birthplace given_name family_name email preferred_username address phone',
    acr_values: 'eidas1',
  };

  return (
    <div className="container mt-5">
      <div className="text-center text-danger">
        Vous devez vous authentifier afin d&apos;accéder à vos données
        personnelles.
      </div>

          <form className="text-center" method="post" action="https://ud-back.docker.dev-franceconnect.fr/redirect-to-idp">
          <input type="hidden" name="scope" value={initialValues.scope} />
          <input type="hidden" name="acr_values" value={initialValues.acr_values} />
            <input type="hidden" name="providerUid" value="envIssuer" />
            <button className="btn" type="submit">
              <img
                alt="Connexion FC"
                className="d-inline-block align-top"
                src="/img/FCboutons-10.svg"
              />
            </button>
          </form>

    </div>
  );
}

export default HomePage;
