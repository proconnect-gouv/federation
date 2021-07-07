import { Link } from 'react-router-dom';

import HeaderLogo from './layout-header-logo';

function HeaderComponent(): JSX.Element {
  return (
    <header className="container d-flex flex-row justify-content-between align-items-center py-3">
      <span />
      <HeaderLogo />
      <Link to="/mes-connexions">Mes connexions</Link>
    </header>
  );
}

export default HeaderComponent;
