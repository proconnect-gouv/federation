import axios from 'axios';
import { useEffect, useState } from 'react';

import { ButtonFranceConnect } from '../assets/buttons';

function HomePage(): JSX.Element {
  const [mounted, setMounted] = useState(false);
  const [csrf, setCsrf] = useState(undefined);

  const initialValues = {
    acr_values: 'eidas1',
    scope:
      'openid gender birthdate birthcountry birthplace given_name family_name email preferred_username address phone',
  };

  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      axios({
        method: 'get',
        url: 'https://ud.docker.dev-franceconnect.fr/api/csrf-token',
      }).then(response => {
        setCsrf(response.data.csrfToken);
      });
    }
  }, [mounted]);

  return (
    <div className="content-wrapper-lg text-center" id="page-container">
      <h1 className="is-blue-france is-bold mb32">
        Pour accéder à votre historique d&apos;utilisation de FranceConnect,
        veuillez vous connecter
      </h1>
      <form
        action="https://ud.docker.dev-franceconnect.fr/api/redirect-to-idp"
        aria-label="form"
        method="post">
        <input name="scope" type="hidden" value={initialValues.scope} />
        <input
          name="acr_values"
          type="hidden"
          value={initialValues.acr_values}
        />
        <input name="providerUid" type="hidden" value="envIssuer" />
        {csrf && <input name="csrfToken" type="hidden" value={csrf} />}
        <ButtonFranceConnect type="submit" />
      </form>
      <p className="mt32">
        Une fois connecté, vous pourrez accéder à l&apos;ensemble des connexions
        et échanges de données liés à votre compte sur les 6 derniers mois.
      </p>
    </div>
  );
}

export default HomePage;
