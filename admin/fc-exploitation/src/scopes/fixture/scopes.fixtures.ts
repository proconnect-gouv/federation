/* istanbul ignore file */

// Declarative code
import { ObjectID } from 'mongodb';
import { IScopes } from '../interface';

export const scopesMock: IScopes = {
  id: new ObjectID('5d9c677da8bb151b00720451'),
  fd: 'Direction générale des Finances publiques',
  scope: 'Seldon',
  label: 'Seldon Label',
};

export const scopesListMock: IScopes[] = [
  {
    id: new ObjectID('5d9c677da8bb151b00720451'),
    scope: 'dgfip_revenu_fiscal_de_reference_identity',
    fd: 'IDENTITY',
    label: 'Revenu fiscal de référence (IDENTITY)',
  },
  {
    id: new ObjectID('5d9c67cda8bd151b00720452'),
    scope: 'dgfip_revenu_fiscal_de_reference_dgfip',
    fd: 'Direction générale des Finances publiques',
    label:
      'Revenu fiscal de référence (Direction générale des Finances publiques)',
  },
  {
    id: new ObjectID('5d9c67cda8bc151b00720452'),
    scope: 'dgfip_revenu_fiscal_de_reference_cnam',
    fd: "Caisse nationale de l'assurance maladie",
    label:
      "Revenu fiscal de référence (Caisse nationale de l'assurance maladie)",
  },
];

export const scopesListGroupedByFdMock: Record<string, IScopes[]> = {
  IDENTITY: [
    {
      id: new ObjectID('5d9c677da8bb151b00720451'),
      scope: 'dgfip_revenu_fiscal_de_reference_identity',
      fd: 'IDENTITY',
      label: 'Revenu fiscal de référence (IDENTITY)',
    },
  ],
  'Direction générale des Finances publiques': [
    {
      id: new ObjectID('5d9c67cda8bd151b00720452'),
      scope: 'dgfip_revenu_fiscal_de_reference_dgfip',
      fd: 'Direction générale des Finances publiques',
      label:
        'Revenu fiscal de référence (Direction générale des Finances publiques)',
    },
  ],
  "Caisse nationale de l'assurance maladie": [
    {
      id: new ObjectID('5d9c67cda8bc151b00720452'),
      scope: 'dgfip_revenu_fiscal_de_reference_cnam',
      fd: "Caisse nationale de l'assurance maladie",
      label:
        "Revenu fiscal de référence (Caisse nationale de l'assurance maladie)",
    },
  ],
};
