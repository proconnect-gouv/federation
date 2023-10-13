import { ILabelMapping } from '../../interfaces';
import { claims } from './cnam.claims';

export const labels: ILabelMapping<typeof claims> = {
  // OIDC fashion variable name
  // eslint-disable-next-line @typescript-eslint/naming-convention
  droits_assurance_maladie: 'Droits assurance maladie',
  // OIDC fashion variable name
  // eslint-disable-next-line @typescript-eslint/naming-convention
  cnam_paiements_ij:
    "Paiements d'indemnités journalières versées par l'Assurance Maladie",
};
