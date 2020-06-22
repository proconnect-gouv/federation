import { basicErrorScenario } from './mire.utils';

describe('RNIPP', () => {
  it('should trigger error Y010004', () => {
    basicErrorScenario({
      errorCode: 'E010004',
      idpId: 'fip1v2',
    });

    cy.hasError('Y010004');
  });

  it('should trigger error Y010006', () => {
    basicErrorScenario({
      errorCode: 'E010006',
      idpId: 'fip1v2',
    });

    cy.hasError('Y010006');
  });

  it('should trigger error Y010007', () => {
    basicErrorScenario({
      errorCode: 'E010007',
      idpId: 'fip1v2',
    });

    cy.hasError('Y010007');
  });

  it('should trigger error Y010008', () => {
    basicErrorScenario({
      errorCode: 'E010008',
      idpId: 'fip1v2',
    });

    cy.hasError('Y010008');
  });

  it('should trigger error Y010009', () => {
    basicErrorScenario({
      errorCode: 'E010009',
      idpId: 'fip1v2',
    });

    cy.hasError('Y010009');
  });

  it('should trigger error Y010011', () => {
    basicErrorScenario({
      errorCode: 'E010011',
      idpId: 'fip1v2',
    });

    cy.hasError('Y010011');
  });

  it('should trigger error Y010012', () => {
    basicErrorScenario({
      errorCode: 'E010012',
      idpId: 'fip1v2',
    });

    cy.hasError('Y010012');
  });

  it('should trigger error Y010013', () => {
    basicErrorScenario({
      errorCode: 'E010013',
      idpId: 'fip1v2',
    });

    cy.hasError('Y010013');
  });

  it('should trigger error Y010015', () => {
    basicErrorScenario({
      errorCode: 'E010015',
      idpId: 'fip1v2',
    });

    cy.hasError('Y010015');
  });
});
