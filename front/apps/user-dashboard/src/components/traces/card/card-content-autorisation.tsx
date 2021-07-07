import { DateTime } from 'luxon';
import { Link } from 'react-router-dom';

import { CardInterfaceBase } from './card.interface';

export const AUTHORISATION_LABEL_TYPE = 'connexion';

function CardContentAutorisationComponent({
  data,
}: CardInterfaceBase): JSX.Element {
  const { account, date, localisation, security } = data;
  return (
    <ul className="list-unstyled">
      <li className="h6 mb-2">
        Heure :&nbsp;
        <Link className="text-charcoal font-weight-bold" to="/">
          {DateTime.fromJSDate(date).toFormat('HH:mm')}
        </Link>
        &nbsp; (heure de Paris)
      </li>
      <li className="h6 mb-2">
        Localisation :&nbsp;
        <Link className="text-charcoal font-weight-bold" to="/">
          aux alentours de ({localisation})
        </Link>
      </li>
      <li className="h6 mb-2">
        Compte utilisé :&nbsp;
        <Link className="text-charcoal font-weight-bold" to="/">
          {account}
        </Link>
      </li>
      <li className="h6 mb-2">
        Niveau de sécurité :&nbsp;
        <Link className="text-charcoal font-weight-bold" to="/">
          {security}
        </Link>
      </li>
    </ul>
  );
}

export default CardContentAutorisationComponent;
