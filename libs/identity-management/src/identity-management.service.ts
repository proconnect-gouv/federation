/* Temporay hard coded oidc values. 
   Remove eslint-disable once values are removed */
/* eslint-disable @typescript-eslint/camelcase */
import { Injectable } from '@nestjs/common';
import { IIdentityManagementService } from '@fc/oidc-provider';

@Injectable()
export class IdentityManagementService implements IIdentityManagementService {
  /**
   * @TODO check input param
   * @TODO type output with an interface
   * @TODO implement real code 😆
   */
  async getIdentity(id: string): Promise<object> {
    return {
      sub:
        id +
        '/4d327dd1e427daf4d50296ab71d6f3fc82ccc40742943521d42cb2bae4df41afv1',
      given_name: 'Angela Claire Louise',
      family_name: 'DUBOIS',
      birthdate: '1962-08-24',
      gender: 'female',
      birthplace: '75107',
      birthcountry: '99100',
      preferred_username: '',
      _claim_names: {},
      _claim_sources: {
        src1: {
          JWT:
            'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.Int9Ig.uJPwtftRcQEhR2JYi4rIetaSA1nVt2g0oI3dZnB3yts',
        },
      },
      phone_number: '0123456789',
      email: 'test@franceconnect.gouv.fr',
      address: {
        country: 'France',
        formatted: 'France Paris 75107 20 avenue de Ségur',
        locality: 'Paris',
        postal_code: '75107',
        street_address: '20 avenue de Ségur',
      },
    };
  }
}
