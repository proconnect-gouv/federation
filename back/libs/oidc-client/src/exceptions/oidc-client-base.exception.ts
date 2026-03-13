import { EnrichedDisplayBaseException } from '@fc/exceptions/exceptions';

export class OidcClientBaseException extends EnrichedDisplayBaseException {
  public scope = 2;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public contactMessage = "Signaler l'erreur au service informatique concerné.";

  constructor(idpName: string, contactEmail: string, error?: Error | string) {
    super(error);

    const emailSubject = encodeURIComponent('Erreur de connexion');
    const humanReadableCurrentDate = new Date().toLocaleString('fr-FR', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });
    const emailBody = encodeURIComponent(`
Bonjour,

Je vous signale une erreur que j’ai rencontrée sur le fournisseur d’identité « ${idpName} » lors d’une tentative de connexion avec ProConnect.

Voici le message d’erreur transmis par le fournisseur d'identité à ProConnect : « ${this.message} »

L'erreur a été reçue à la date suivante : « ${humanReadableCurrentDate} »

Cordialement,
`);
    this.contactHref = `mailto:${contactEmail}?subject=${emailSubject}&body=${emailBody}`;
  }
}
