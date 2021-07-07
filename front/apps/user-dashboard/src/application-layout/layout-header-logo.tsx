import { Link } from 'react-router-dom';

function HeaderLogo(): JSX.Element {
  return (
    <Link className="d-inline-block" to="/">
      <img
        alt="Logo FranceConnect"
        height="73"
        src="/img/fc_logo_v2.png"
        width="auto"
      />
    </Link>
  );
}

export default HeaderLogo;
