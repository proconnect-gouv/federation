/* istanbul ignore file */
import './identity-provider-list.scss';

import React from 'react';

import Cards from '../cards';

function IdentityProviderListComponent(): JSX.Element {
  return (
    <section className="row" id="identity-provider-list">
      <p className="h4 col-12">
        Je recherche les fournisseurs d&apos;identité de mon administration
      </p>
      <div className="col-12">
        <Cards />
      </div>
    </section>
  );
}

export default IdentityProviderListComponent;
