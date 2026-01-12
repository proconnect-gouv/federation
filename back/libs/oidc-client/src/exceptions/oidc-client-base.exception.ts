import { EnrichedDisplayBaseException } from '@fc/exceptions/exceptions';

export class OidcClientBaseException extends EnrichedDisplayBaseException {
  public scope = 2;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public contactMessage = "Signaler l'erreur au service informatique concerné.";

  constructor(contactEmail: string, error?: Error | string) {
    super(error);

    const emailSubject = encodeURIComponent(
      'Correction implémentation ProConnect',
    );
    const emailBody = encodeURIComponent(`
Bonjour,

Voici une erreur remontée par ProConnect suite à une tentative de connexion infructueuse :
- error: ${this.error}
- error_description: ${this.error_description}
- message: ${this.message}

ProConnect a vérifié que l'erreur ne venait pas de leur côté.

Cordialement,
`);
    this.contactHref = `mailto:${contactEmail}?subject=${emailSubject}&body=${emailBody}`;
  }
}
