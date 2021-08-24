import { v4 as uuid } from 'uuid';

import { CardInterface } from '../components/traces/card/card.interface';
import TraceCardList from '../components/traces/list/card-list';

function TracesPage(): JSX.Element {
  const TRACE_LIST = [
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
    } as CardInterface,
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
    } as CardInterface,
    {
      data: {
        date: new Date(),
        id: uuid(),
        list: [
          'Prénoms',
          'Nom de naissance',
          'Nom d’usage',
          'Date de naissance',
          'Civilité',
        ],
        title:
          'Portail Fonds de solidarité pour les TPE et indépendants - Martinique',
      },
      type: 'autorisation',
    } as CardInterface,
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
    } as CardInterface,
    {
      data: {
        date: new Date('2020-10-10'),
        id: uuid(),
        list: [
          'Prénoms',
          'Nom de naissance',
          'Nom d’usage',
          'Date de naissance',
          'Civilité',
        ],
        title:
          'Portail Fonds de solidarité pour les TPE et indépendants - Martinique',
      },
      type: 'autorisation',
    } as CardInterface,
    {
      data: {
        date: new Date('2020-02-01'),
        id: uuid(),
        list: [
          'Prénoms',
          'Nom de naissance',
          'Nom d’usage',
          'Date de naissance',
          'Civilité',
        ],
        title:
          'Portail Fonds de solidarité pour les TPE et indépendants - Martinique',
      },
      type: 'autorisation',
    } as CardInterface,
  ];
  return (
    <section className="container">
      <div className="d-flex flex-column align-items-center">
        <div className="col-sm-7">
          <header className="section text-center mt-5">
            <h3 className="text-primary">Bienvenue</h3>
            <h1 className="text-primary font-weight-bold">Aurélie Duponts</h1>
          </header>
          <div className="section mt-5">
            <h3 className="text-primary font-weight-bold">
              Votre historique de connexion
            </h3>
            <h5>
              Retrouver toutes les connexions et échanges de données effectués
              via FranceConnect ces six derniers mois. Cliquez sur une connexion
              pour en afficher les détails.
            </h5>
          </div>
          <div className="mt-5">
            <TraceCardList items={TRACE_LIST} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default TracesPage;
