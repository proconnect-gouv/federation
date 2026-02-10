import { EnrichedDisplayBaseException } from '@fc/exceptions/exceptions';

export class OidcClientBaseException extends EnrichedDisplayBaseException {
  public scope = 2;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public contactMessage = "Signaler l'erreur au service informatique concerné.";

  constructor(contactEmail: string, error?: Error | string) {
    super(error);

    const emailSubject = encodeURIComponent('Erreur de connexion');
    const emailBody = encodeURIComponent(`
Bonjour,

Je vous signale une erreur que j’ai rencontrée sur le fournisseur d’identité lors d’une tentative de connexion avec ProConnect.

Voici le message d’erreur reçu par ProConnect :

- timestamp: "${new Date().toISOString()}"
- message: "${this.message}"

Cordialement,
`);
    this.contactHref = `mailto:${contactEmail}?subject=${emailSubject}&body=${emailBody}`;
  }
}
