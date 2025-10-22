import * as undiciPackage from 'undici/package.json';

// Undici is already used by node but we cannot use the undici module from node
// cf https://github.com/nodejs/undici/discussions/2371 .
// To avoid any side effect by having two different versions, this test ensures that
// the undici version used by node is the same as the one declared in package.json
describe('Undici version', () => {
  it('should be the same undici version in package.json than the one used by node', () => {
    expect(process.versions.undici).toBe(undiciPackage.version);
  });
});
