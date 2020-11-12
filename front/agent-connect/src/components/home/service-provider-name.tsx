/* istanbul ignore file */
import React from 'react';

const ServiceProviderNameComponent = (): JSX.Element => {
  return (
    <section className="row mt-5 mb-8 text-center">
      <p className="h4 col-12">Je choisis un compte pour me connecter sur</p>
      <h1 className="col-12 text-center font-weight-bold text-primary">
        <span>Name of the fournisseur</span>
      </h1>
    </section>
  );
};

export default ServiceProviderNameComponent;
