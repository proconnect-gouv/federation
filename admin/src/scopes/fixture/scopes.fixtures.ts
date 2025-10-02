/* istanbul ignore file */

// Declarative code
import { ObjectId } from 'mongodb';
import { IScopes } from '../interface';

export const scopesMock: IScopes = {
  _id: new ObjectId('5d9c677da8bb151b00720451'),
  fd: 'Direction générale des Finances publiques',
  scope: 'Seldon',
  label: 'Seldon Label',
};

export const scopesListMock: IScopes[] = [
  {
    _id: new ObjectId('5d9c677da8bb151b00720451'),
    scope: 'dgfip_revenu_fiscal_de_reference_identity',
    fd: 'IDENTITY',
    label: 'Revenu fiscal de référence (IDENTITY)',
  },
  {
    _id: new ObjectId('5d9c67cda8bd151b00720452'),
    scope: 'dgfip_revenu_fiscal_de_reference_dgfip',
    fd: 'Direction générale des Finances publiques',
    label:
      'Revenu fiscal de référence (Direction générale des Finances publiques)',
  },
  {
    _id: new ObjectId('5d9c67cda8bc151b00720452'),
    scope: 'dgfip_revenu_fiscal_de_reference_cnam',
    fd: "Caisse nationale de l'assurance maladie",
    label:
      "Revenu fiscal de référence (Caisse nationale de l'assurance maladie)",
  },
];

export const scopesListGroupedByFdMock: Record<string, IScopes[]> = {
  IDENTITY: [
    {
      _id: new ObjectId('5d9c677da8bb151b00720451'),
      scope: 'dgfip_revenu_fiscal_de_reference_identity',
      fd: 'IDENTITY',
      label: 'Revenu fiscal de référence (IDENTITY)',
    },
  ],
  'Direction générale des Finances publiques': [
    {
      _id: new ObjectId('5d9c67cda8bd151b00720452'),
      scope: 'dgfip_revenu_fiscal_de_reference_dgfip',
      fd: 'Direction générale des Finances publiques',
      label:
        'Revenu fiscal de référence (Direction générale des Finances publiques)',
    },
  ],
  "Caisse nationale de l'assurance maladie": [
    {
      _id: new ObjectId('5d9c67cda8bc151b00720452'),
      scope: 'dgfip_revenu_fiscal_de_reference_cnam',
      fd: "Caisse nationale de l'assurance maladie",
      label:
        "Revenu fiscal de référence (Caisse nationale de l'assurance maladie)",
    },
  ],
};
