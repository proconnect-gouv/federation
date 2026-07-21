# Hyyyperbridge

## Objectif

Pour permettre à des utilisateurs sur Internet disposant d'un accès au RIE d'accéder à des fournisseurs d'identité (FI) accessibles uniquement depuis le réseau RIE, la passerelle Hyyyperbridge met en place une rupture protocolaire.

L’application Fédération (côté Internet) envoie une requête RPC via RabbitMQ. Le consumer RIE reçoit cette requête, exécute l’appel HTTP vers le FI côté RIE, puis renvoie la réponse.

## Principe de fonctionnement

- Côté émetteur : `send("HTTP_PROXY", message)` envoie une requête RPC.
- Côté consumer : `@MessagePattern("HTTP_PROXY")` traite la requête.
- Côté transport : RabbitMQ achemine la requête vers la queue métier `rie`.
- Côté réponse : Nest/RabbitMQ gèrent automatiquement la corrélation.

## Séquence nominale

```mermaid
sequenceDiagram
    autonumber
    participant Core as Core FCA (OidcClientService)
    participant RMQ as RabbitMQ (queue: rie)
    participant RIE as CSMR RIE (@MessagePattern HTTP_PROXY)
    participant IDP as IdP cible (HTTP)

    Core->>RMQ: send("HTTP_PROXY", message)
    RMQ->>RIE: Routage vers le consumer HTTP_PROXY
    RIE->>RIE: Validation du payload (ValidationPipe)
    RIE->>IDP: fetch(url, method, headers, body)
    IDP-->>RIE: Réponse HTTP (status, headers, body)
    RIE-->>RMQ: Retour enveloppe DATA
    RMQ-->>Core: Réponse RPC corrélée
    Core->>Core: lastValueFrom(order) + validate(enveloppe)
```

## Séquence en erreur (timeout / exception)

```mermaid
sequenceDiagram
    autonumber
    participant Core as Core FCA (OidcClientService)
    participant RMQ as RabbitMQ
    participant RIE as CSMR RIE
    participant IDP as IdP cible

    Core->>RMQ: send("HTTP_PROXY", message).pipe(timeout)
    RMQ->>RIE: Livraison du message
    RIE->>IDP: fetch(...)
    alt Erreur HTTP/réseau côté RIE
        IDP--xRIE: Exception
        RIE-->>RMQ: Enveloppe ERROR
        RMQ-->>Core: Réponse ERROR corrélée
        Core->>Core: throw HyyyperbridgeCsmrException
    else Dépassement du requestTimeout côté Core
        Core--xCore: Timeout RxJS
        Core->>Core: throw HyyyperbridgeRabbitmqException
    end
```

## Notes d'architecture

- L'utilisation de Hyyyperbridge implique une instance **Fédération Internet** + un **consumer côté RIE**.
- **L'instance Fédération RIE n'est pas impliquée** dans ce flux.
