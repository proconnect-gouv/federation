export const getDefaultContactHref = (
  error: {
    code: string;
    id: string;
    message: string;
  },
  extraParams?: {
    spName: string | undefined;
    idpName: string | undefined;
  },
) => {
  const notProvided = 'non renseigné';

  const idpName = extraParams?.idpName ?? notProvided;
  const spName = extraParams?.spName ?? notProvided;

  const errorCode = error.code ?? notProvided;
  const errorId = error.id ?? notProvided;
  const errorMessage = error.message ?? notProvided;

  const defaultEmailBody = encodeURIComponent(`Bonjour,

Je vous signale une erreur que j’ai rencontrée sur ProConnect :

- Code de l’erreur : "${errorCode}" ;
- Identifiant de l’erreur : "${errorId}" ;
- Message d’erreur : "${errorMessage}".

Je souhaitais me connecter à « ${spName} ».

Mon fournisseur d’identité est « ${idpName} ».

Cordialement,
`);
  const defaultEmailSubject = encodeURIComponent(
    `Signaler l’erreur ${errorCode} sur ProConnect`,
  );
  const defaultEmailAddress = encodeURIComponent(
    'support+federation@proconnect.gouv.fr',
  );

  return `mailto:${defaultEmailAddress}?subject=${defaultEmailSubject}&body=${defaultEmailBody}`;
};
