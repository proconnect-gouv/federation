import React from 'react';

function NoSearchResultsComponent(): JSX.Element {
  return (
    <div className="col-10 offset-1 text-left">
      Aucun fournisseur d&apos;identités n&apos;a été trouvé
    </div>
  );
}

NoSearchResultsComponent.displayName = 'NoSearchResultsComponent';

export default NoSearchResultsComponent;
