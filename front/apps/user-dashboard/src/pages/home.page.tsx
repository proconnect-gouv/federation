function HomePage(): JSX.Element {
  const initialValues = {
    acr_values: 'eidas1',
    scope:
      'openid gender birthdate birthcountry birthplace given_name family_name email preferred_username address phone',
  };

  return (
    <div className="container mt-5">
      <div aria-level={1} className="text-center text-danger" role="heading">
        Vous devez vous authentifier afin d&apos;accéder à vos données
        personnelles.
      </div>
      <form
        action="https://ud.docker.dev-franceconnect.fr/api/redirect-to-idp"
        aria-label="form"
        className="text-center"
        method="post">
        <input name="scope" type="hidden" value={initialValues.scope} />
        <input
          name="acr_values"
          type="hidden"
          value={initialValues.acr_values}
        />
        <input name="providerUid" type="hidden" value="envIssuer" />
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
