import { EnrichedDisplayBaseException } from "@fc/exceptions/exceptions";
import { isEmpty } from "class-validator";
import { OidcClientSessionParams } from "../interfaces";

export class OidcClientBaseException extends EnrichedDisplayBaseException {
  public scope = 2;
  public error = "server_error";
  public error_description =
    "authentication aborted due to a technical error on the authorization server";
  public contactMessage = "Signaler l'erreur au service informatique concerné.";
  public displayContact = false;

  constructor(
    contactEmail?: string,
    idpName?: string,
    error?: Error | string,
    sessionParams?: OidcClientSessionParams,
  ) {
    super(error);

    if (!isEmpty(contactEmail)) {
      const emailSubject = encodeURIComponent("Erreur de connexion");

      const humanReadableCurrentDate = new Date().toLocaleString("fr-FR", {
        timeZone: "Europe/Paris",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      });

      const emailBody = encodeURIComponent(`
      Bonjour,

      Je vous signale une erreur que j’ai rencontrée sur le fournisseur d’identité lors d’une tentative de connexion avec ProConnect.

      Voici les logs complets de connexion :

      - timestamp: « ${humanReadableCurrentDate} »
      - nom du fournisseur d'identité: ${idpName}
      - nom de l'erreur ProConnect: ${this.constructor.name}
      - message envoyé par le fournisseur d'identité : "${this.message ? this.message : "le fournisseur d'identité n'a pas envoyé de message d'erreur"}"
      - nom du service depuis lequel la connexion est initiée : ${sessionParams?.spName}
      - email de l'utilisateur envoyé au fournisseur d'identité (login_hint) : ${sessionParams?.idpLoginHint}

      Cordialement,
      `);

      this.contactHref = `mailto:${contactEmail}?subject=${emailSubject}&body=${emailBody}`;

      this.description = `Erreur technique sur le serveur d'authentification. Veuillez réessayer de vous connecter. Si le problème persiste, vous pouvez signaler l'erreur à votre portail de connexion à l'adresse suivante : <a href="${this.contactHref}">${contactEmail}</a>`;
    }
  }
}
