import { User, UserCredentials } from '../types';

const DEFAULT_USER_CRITERIA = 'par défaut';

export const getUserByCriteria = (users: User[], criteria: string[]): User => {
  const user: User = users.find((user) =>
    criteria.every((criterion) => user.criteria.includes(criterion)),
  );
  expect(user, `No user matches the criteria ${JSON.stringify(criteria)}`).to
    .exist;
  cy.wrap(user).as('user');
  return user;
};

export const getEnabledUserByIdpId = (users: User[], idpId: string): User => {
  const currentUser = users.find(
    (user: User) =>
      user.enabled === true &&
      user.credentials.some(
        (credentials: UserCredentials): boolean => credentials.idpId === idpId,
      ),
  );
  expect(
    currentUser,
    `No active user has credentials for the identity provider '${idpId}'`,
  ).to.exist;
  cy.wrap(currentUser).as('user');
  return currentUser;
};

export const getDefaultUser = (users: User[]): User =>
  getUserByCriteria(users, [DEFAULT_USER_CRITERIA]);
