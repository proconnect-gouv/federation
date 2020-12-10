/* istanbul ignore file */

/**
 * Not yet implemented
 */
import React from 'react';

function ErrorPage(): JSX.Element {
  return (
    <div className="container">
      <h1 className="text-center">Une erreur est survenue</h1>
      <h2 className="text-center">
        Error:
        <span id="error-title">Erreur</span>
      </h2>
      <p className="text-center">Ceci est une erreur</p>
    </div>
  );
}

export default ErrorPage;
