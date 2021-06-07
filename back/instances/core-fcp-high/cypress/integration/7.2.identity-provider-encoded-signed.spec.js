import {
  basicSuccessScenario,
  checkInformationsServiceProvider,
  checkInStringifiedJson,
} from './mire.utils';

describe('7.2 - IdP work cycle for [eidas level] [encryption] [signature]', () => {
  it('should complete a workcycle for [fip13v2] : eIDAS élevé - crypted (ECDH-ES + A256GCM) - signed (ES256)', () => {
    const idpId = 'fip13v2';

    basicSuccessScenario({
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId,
    });

    checkInformationsServiceProvider({
      gender: 'Femme',
      givenName: 'Angela Claire Louise',
      familyName: 'DUBOIS',
      birthdate: '1962-08-24',
      birthplace: '75107',
      birthcountry: '99100',
    });

    checkInStringifiedJson(
      'sub',
      '4d327dd1e427daf4d50296ab71d6f3fc82ccc40742943521d42cb2bae4df41afv1',
    );
  });

  it('should complete a workcycle for [fip14v2] : eIDAS élevé - crypted (RSA-OAEP + A256GCM) - signed (RS256)', () => {
    const idpId = 'fip14v2';

    basicSuccessScenario({
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId,
    });

    checkInformationsServiceProvider({
      gender: 'Femme',
      givenName: 'Angela Claire Louise',
      familyName: 'DUBOIS',
      birthdate: '1962-08-24',
      birthplace: '75107',
      birthcountry: '99100',
    });

    checkInStringifiedJson(
      'sub',
      '4d327dd1e427daf4d50296ab71d6f3fc82ccc40742943521d42cb2bae4df41afv1',
    );
  });

  it('should complete a workcycle for [fip15v2] : eIDAS substantiel - crypted (ECDH-ES + A256GCM) - signed (ES256)', () => {
    const idpId = 'fip15v2';

    basicSuccessScenario({
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId,
    });

    checkInformationsServiceProvider({
      gender: 'Femme',
      givenName: 'Angela Claire Louise',
      familyName: 'DUBOIS',
      birthdate: '1962-08-24',
      birthplace: '75107',
      birthcountry: '99100',
    });

    checkInStringifiedJson(
      'sub',
      '4d327dd1e427daf4d50296ab71d6f3fc82ccc40742943521d42cb2bae4df41afv1',
    );
  });

  it('should complete a workcycle for [fip16v2] : eIDAS substantiel - crypted (RSA-OAEP + A256GCM) - signed (RS256)', () => {
    const idpId = 'fip16v2';

    basicSuccessScenario({
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId,
    });

    checkInformationsServiceProvider({
      gender: 'Femme',
      givenName: 'Angela Claire Louise',
      familyName: 'DUBOIS',
      birthdate: '1962-08-24',
      birthplace: '75107',
      birthcountry: '99100',
    });

    checkInStringifiedJson(
      'sub',
      '4d327dd1e427daf4d50296ab71d6f3fc82ccc40742943521d42cb2bae4df41afv1',
    );
  });

  it('should complete a workcycle for [fip17v2] : eIDAS substantiel - crypted (none) - signed (ES256)', () => {
    const idpId = 'fip17v2';

    basicSuccessScenario({
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId,
    });

    checkInformationsServiceProvider({
      gender: 'Femme',
      givenName: 'Angela Claire Louise',
      familyName: 'DUBOIS',
      birthdate: '1962-08-24',
      birthplace: '75107',
      birthcountry: '99100',
    });

    checkInStringifiedJson(
      'sub',
      '4d327dd1e427daf4d50296ab71d6f3fc82ccc40742943521d42cb2bae4df41afv1',
    );
  });

  it('should complete a workcycle for [fip18v2] : eIDAS faible - crypted (none) - signed (ES256)', () => {
    const idpId = 'fip18v2';

    basicSuccessScenario({
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId,
    });

    checkInformationsServiceProvider({
      gender: 'Femme',
      givenName: 'Angela Claire Louise',
      familyName: 'DUBOIS',
      birthdate: '1962-08-24',
      birthplace: '75107',
      birthcountry: '99100',
    });

    checkInStringifiedJson(
      'sub',
      '4d327dd1e427daf4d50296ab71d6f3fc82ccc40742943521d42cb2bae4df41afv1',
    );
  });

  it('should complete a workcycle for [fip19v2] : eIDAS faible - crypted (none) - signed (RS256)', () => {
    const idpId = 'fip19v2';

    basicSuccessScenario({
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId,
    });

    checkInformationsServiceProvider({
      gender: 'Femme',
      givenName: 'Angela Claire Louise',
      familyName: 'DUBOIS',
      birthdate: '1962-08-24',
      birthplace: '75107',
      birthcountry: '99100',
    });

    checkInStringifiedJson(
      'sub',
      '4d327dd1e427daf4d50296ab71d6f3fc82ccc40742943521d42cb2bae4df41afv1',
    );
  });

  it('should complete a workcycle for [fip20v2] : eIDAS faible - crypted (none) - signed (HS256)', () => {
    const idpId = 'fip20v2';

    basicSuccessScenario({
      userName: 'test',
      password: '123',
      eidasLevel: 1,
      idpId,
    });

    checkInformationsServiceProvider({
      gender: 'Femme',
      givenName: 'Angela Claire Louise',
      familyName: 'DUBOIS',
      birthdate: '1962-08-24',
      birthplace: '75107',
      birthcountry: '99100',
    });

    checkInStringifiedJson(
      'sub',
      '4d327dd1e427daf4d50296ab71d6f3fc82ccc40742943521d42cb2bae4df41afv1',
    );
  });
});
