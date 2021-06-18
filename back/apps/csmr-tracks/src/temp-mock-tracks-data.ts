/* istanbul ignore file */

// Declarative code
/**
 *  @todo #339 remove this file once real code is implemented
 */
import { v4 as uuid } from 'uuid';

export const mockedData = [
  {
    data: {
      account: 'ANTS',
      date: new Date('2020-03-09'),
      id: uuid(),

      localisation: 'FR',
      security: 'eidas1',
      title: "Les sites de l'Agence Nationale des Titres Sécurisés",
    },
    type: 'connexion',
  },
  {
    data: {
      account: 'ameli',
      date: new Date('2019-03-09'),
      id: uuid(),

      localisation: 'FR',
      security: 'eidas1',
      title: "Le site de l'assurance maladie en ligne",
    },
    type: 'connexion',
  },
  {
    data: {
      date: new Date(),
      id: uuid(),
      list: [
        'Prénoms',
        'Nom de famille',
        'Nom d’usage',
        'Date de naissance',
        'Civilité',
      ],
      title:
        'Portail Fonds de solidarité pour les TPE et indépendants - Martinique',
    },
    type: 'autorisation',
  },
  {
    data: {
      date: new Date(),
      id: uuid(),
      list: [
        'OpenID',
        'Revenu fiscal de référence (DGFIP)',
        'Nombre de parts du foyer fiscal (DGFIP)',
        'Situation Familiale (DGFIP)',
        'Nombre et détail des personnes à charge (DGFIP)',
        'Adresse fiscale de taxation (DGFIP)',
      ],
      title: 'Caluire-et-Cuire',
    },
    type: 'échange de données',
  },
  {
    data: {
      date: new Date('2020-10-10'),
      id: uuid(),
      list: [
        'Prénoms',
        'Nom de famille',
        'Nom d’usage',
        'Date de naissance',
        'Civilité',
      ],
      title:
        'Portail Fonds de solidarité pour les TPE et indépendants - Martinique',
    },
    type: 'autorisation',
  },
  {
    data: {
      date: new Date('2020-02-01'),
      id: uuid(),
      list: [
        'Prénoms',
        'Nom de famille',
        'Nom d’usage',
        'Date de naissance',
        'Civilité',
      ],
      title:
        'Portail Fonds de solidarité pour les TPE et indépendants - Martinique',
    },
    type: 'autorisation',
  },
];
