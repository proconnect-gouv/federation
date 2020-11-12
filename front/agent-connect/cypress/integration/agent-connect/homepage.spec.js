/* eslint
  jest/expect-expect: 0 */
describe('Homepage', () => {
  it('should match snapshot', () => {
    cy.visit('http://localhost:3000');
    cy.matchImageSnapshot('homepage');
  });
});
