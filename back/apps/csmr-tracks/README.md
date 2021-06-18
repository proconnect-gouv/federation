# Consumer Traces

## À propos

Cette application est un consumer RabbitMQ qui prend en charge les messages de demandes de traces usager et renvoie les informations.

Le consumer écoute le `pattern` (au sens de NestJs) "TRACKS_GET"

## Utilisation 

### Raw

Depuis l'[interface graphique de RabbitMQ](http://localhost:15673/#/queues/%2F/tracks) :

```json
{
  "pattern": "TRACKS_GET",
  "data": {
    "foo": "bar"
  }
}
```

### Depuis Nest

```typescript
import { timeout } from 'rxjs/operators';
import { TracksProtocol } from '@fc/microservices';

class MyService {

  constructor(@Inject('TracksBroker') private broker: ClientProxy) {}

  myMethod() {    
    // Fonction de callback
    const next = (resolve, reject, data): void => resolve(data);

    // Fonction d'erreur
    const error = (error) => console.error(error);

    // Données à envoyer
    const payload = { foo: 'bar' };

    this.broker.send(TracksProtocol.Commands.GET, payload)
      // Gestion native du timeout
      .pipe(timeout(requestTimeout))
      // Écoute de la "réponse" de RabbitMQ
      .subscribe({
        next,
        error,
      });
  }
}
```