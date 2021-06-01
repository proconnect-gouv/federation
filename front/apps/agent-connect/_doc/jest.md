## Exemples de Tests

**Boucher une function exporter d'un fichier**

```
import { mocked } from 'ts-jest/utils';
import { removeIdentityProvider } from '../../../redux/actions';
...
jest.mock('../../../redux/actions');
...
const spy = mocked(removeIdentityProvider, true);
spy.mockReturnValueOnce(action);
```

**Faire un test d'un composant qui utilise Redux**

```
import { renderWithRedux } from '../../testUtils';
...
const { getByText } = renderWithRedux(
  <IdentityProviderCard {...props} />,
  { initialState },
)
```

## Erreurs

**Error: Not implemented: HTMLFormElement.prototype.submit**

L'erreur est dûe au fait que `jsdom` ne gère pas l'envoi de formulaire

> @TODO trouver une solution pérenne sur tous les tests pour boucher la console avec un filtre sur ce type de message

https://github.com/jsdom/jsdom/issues/1937#issuecomment-526162324
