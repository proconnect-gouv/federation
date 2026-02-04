import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiEntrepriseService {
  constructor() {}

  getOrganizationBySiret() {
    console.log('Getting organization by SIRET...');
    return null;
  }
}
