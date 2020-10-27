/* istanbul ignore file */
import React from 'react';

function HeaderComponent(): JSX.Element {
  return (
    <header className="d-flex flex-row justify-content-between align-items-center py-3 mb-5">
      <img alt="logo marianne" src="/img/logo-marianne.svg" />
      <img alt="logo agentconnect" src="/img/logo-agentconnect.svg" />
    </header>
  );
}

export default HeaderComponent;
