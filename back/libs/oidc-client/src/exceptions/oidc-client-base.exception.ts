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

  constructor(errorParams?: OidcClientSessionParams, error?: Error | string) {
    super(error);

    if (!isEmpty(errorParams?.contactEmail)) {
      const { contactEmail, idpName, spName, idpLoginHint } = errorParams!;

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

      Je vous signale une erreur que j’ai rencontrée lors d’une tentative de connexion ProConnect.

      Voici les logs complets de connexion :

      - timestamp: « ${humanReadableCurrentDate} »
      - nom du fournisseur d'identité : ${idpName}
      - nom de l'erreur ProConnect : ${this.constructor.name}
      - message envoyé par le fournisseur d'identité : "${this.message ? this.message : "le fournisseur d'identité n'a pas envoyé de message d'erreur"}"
      - nom du service depuis lequel la connexion est initiée : ${spName}
      - email de l'utilisateur envoyé au fournisseur d'identité (login_hint) : ${idpLoginHint}

      Cordialement,
      `);

      this.contactHref = `mailto:${contactEmail}?subject=${emailSubject}&body=${emailBody}`;

      this.description = `Erreur technique sur le serveur d'authentification. Veuillez réessayer de vous connecter. Si le problème persiste, vous pouvez signaler l'erreur à votre portail de connexion à l'adresse suivante : <a href="${this.contactHref}">${contactEmail}</a>`;

      this.additionalErrorLogs = [
        { label: "timestamp", value: humanReadableCurrentDate },
        { label: "fournisseur d'identité", value: idpName },
        { label: "nom de l'erreur ProConnect", value: this.constructor.name },
        { label: "service", value: spName },
        { label: "login hint", value: idpLoginHint },
      ];
    }
  }
}
