import React from 'react';
import { Link } from 'react-router-dom';

function FooterComponent(): JSX.Element {
  return (
    <footer className="fixed-bottom bg-primary">
      <nav className="container text-center p-5 text-white">
        <Link className="text-white" to="/">
          En savoir plus sur FranceConnect
        </Link>
        <span className="mx-1">|</span>
        <Link className="text-white" to="/">
          CGU
        </Link>
        <span className="mx-1">|</span>
        <Link className="text-white" to="/">
          Foire aux questions
        </Link>
        <span className="mx-1">|</span>
        <Link className="text-white" to="/">
          Vous êtes un aidant professionnel
        </Link>
      </nav>
    </footer>
  );
}

export default FooterComponent;
