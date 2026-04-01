import { EnrichedDisplayBaseException } from "@fc/exceptions/exceptions";
import { isEmpty } from "lodash";

export class OidcClientBaseException extends EnrichedDisplayBaseException {
  public scope = 2;
  public error = "server_error";
  public error_description =
    "authentication aborted due to a technical error on the authorization server";
  public contactMessage = "Signaler l'erreur au service informatique concerné.";
  public displayContact = false;

  constructor(contactEmail?: string, error?: Error | string) {
    super(error);

    if (!isEmpty(contactEmail)) {
      const emailSubject = encodeURIComponent("Erreur de connexion");
      const emailBody = encodeURIComponent(`
Bonjour,

Voici les logs complets de connexion :
- timestamp: ok
- nom du fournisseur d'identité: (à prendre dans la base)
- nom de l'erreur ProConnect: ${this.constructor.name}
- message envoyé par le fournisseur d'identité (si vide : "le fournisseur d'identité n'a pas envoyé de message d'erreur)
- nom du service depuis lequel la connexion est initiée: (à prendre dans la session)
- email de l'utilisateur envoyé au fournisseur d'identité (login_hint): (à prendre dans la session)

Je vous signale une erreur que j’ai rencontrée sur le fournisseur d’identité lors d’une tentative de connexion avec ProConnect.

Voici le message d’erreur reçu par ProConnect :

- timestamp: "${new Date().toISOString()}"
${
  this.message
    ? `- message: "${this.message}"
`
    : ""
}
Cordialement,
`);
      const contactHref = `mailto:${contactEmail}?subject=${emailSubject}&body=${emailBody}`;
      this.description = `Erreur technique sur le serveur d'authentification. Contactez le service informatique si le problème persiste. <a href="mailto:${contactHref}"> </a>`;
    }
  }
}
