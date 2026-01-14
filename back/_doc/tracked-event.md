### Événements Traqués (Tracked Events)

Ce document décrit les événements de suivi (logs de parcours) générés par le système et le moment précis où ils sont
déclenchés. Ces événements permettent de suivre le cycle de vie d'une authentification ou d'une déconnexion.

| Événement                       | Étape | Description                                                                                                                                                                            |
|---------------------------------|-------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `FC_AUTHORIZE_INITIATED`        | 1.0.0 | Déclenché lorsqu'une requête d'autorisation est reçue par ProConnect de la part d'un Fournisseur de Service.                                                                           |
| `FC_SHOWED_IDP_CHOICE`          | 2.0.0 | Déclenché lorsque ProConnect affiche la page pour entrer son email à l'utilisateur.                                                                                                    |
| `FC_SSO_INITIATED`              | 2.1.0 | Déclenché lorsqu'une session active est réutilisée (Single Sign-On), évitant à l'utilisateur de se ré-authentifier.                                                                    |
| `FC_REDIRECTED_TO_HINTED_IDP`   | 2.2.0 | Déclenché lorsque l'utilisateur est redirigé directement vers un FI suggéré par le Fournisseur de Service (via l'argument `idp_hint`).                                                 |
| `FC_REDIRECTED_TO_HINTED_LOGIN` | 2.3.0 | Déclenché lorsque l'utilisateur est redirigé vers un FI basé sur un email suggéré par le Fournisseur de Service (via l'argument `login_hint`).                                         |
| `IDP_CHOSEN`                    | 3.0.0 | Déclenché une fois qu'un Fournisseur d'Identité a été sélectionné (soit par choix de l'utilisateur, soit par redirection automatique) et que la redirection vers celui-ci est initiée. |
| `IDP_CALLEDBACK`                | 4.0.0 | Déclenché lorsque le Fournisseur d'Identité renvoie l'utilisateur vers ProConnect après son authentification.                                                                          |
| `FC_REQUESTED_IDP_TOKEN`        | 4.1.0 | Déclenché lorsque ProConnect demande un jeton d'accès (token) au Fournisseur d'Identité.                                                                                               |
| `FC_REQUESTED_IDP_USERINFO`     | 4.2.0 | Déclenché lorsque ProConnect récupère les informations de l'utilisateur (Userinfo) auprès du Fournisseur d'Identité.                                                                   |
| `FC_VERIFIED`                   | 5.0.0 | Déclenché lorsque l'identité de l'utilisateur a été vérifiée avec succès et que ProConnect est prêt à rediriger l'utilisateur vers le Fournisseur de Service.                          |
| `FC_IDP_DISABLED`               | 5.1.0 | Déclenché lorsque le Fournisseur d'Identité utilisé est désactivé ou indisponible lors de la vérification.                                                                             |
| `FC_REDIRECTED_TO_SP`           | 7.0.0 | *Note : Cet événement est défini mais n'est pas utilisé explicitement dans le code actuel.*                                                                                            |
| `SP_REQUESTED_FC_TOKEN`         | 7.1.0 | Déclenché lorsque le Fournisseur de Service demande un jeton d'accès (token) à ProConnect.                                                                                             |
| `SP_REQUESTED_FC_USERINFO`      | 7.2.0 | Déclenché lorsque le Fournisseur de Service récupère les informations de l'utilisateur (Userinfo) auprès de ProConnect. C'est le dernier événement d'un processus de connexion.        |
| `SP_REQUESTED_LOGOUT`           | 8.0.0 | Déclenché lorsqu'une demande de déconnexion est initiée par le Fournisseur de Service.                                                                                                 |
| `FC_REQUESTED_LOGOUT_FROM_IDP`  | 8.1.0 | Déclenché lorsque ProConnect propage la déconnexion auprès du Fournisseur d'Identité (si celui-ci supporte la déconnexion).                                                            |
| `FC_SESSION_TERMINATED`         | 8.2.0 | Déclenché lorsque le processus de déconnexion est terminé et que ProConnect est prêt à rediriger l'utilisateur vers le Fournisseur de Service.                                         |
