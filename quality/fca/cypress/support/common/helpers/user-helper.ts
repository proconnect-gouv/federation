export interface User {
  belonging_population: string;
  'chorusdt:matricule': string;
  'chorusdt:societe': string;
  custom: { [key: string]: unknown };
  given_name: string;
  is_service_public: string;
  organizational_unit: string;
  phone_number: string;
  siren: string;
  siret: string;
  uid: string;
  usual_name: string;
}

export function getDefaultUser(): User {
  return {
    belonging_population: 'agent',
    'chorusdt:matricule': 'USER_AGC',
    'chorusdt:societe': 'CHT',
    custom: {
      email_verified: false,
      phone_number_verified: false,
    },
    given_name: 'John',
    is_service_public: 'true',
    organizational_unit: 'comptabilite',
    phone_number: '+49 000 000000',
    siren: '130025265',
    siret: '13002526500013',
    uid: '1',
    usual_name: 'Doe',
  };
}
