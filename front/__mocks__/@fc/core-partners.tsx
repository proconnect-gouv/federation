export const VersionComponent = jest.fn(() => <div data-mockid="VersionComponent" />);

export const VersionsListComponent = jest.fn(() => <div data-mockid="VersionsListComponent" />);

export const VersionsService = {
  create: jest.fn(),
  loadAll: jest.fn(),
  loadSchema: jest.fn(),
  read: jest.fn(),
  update: jest.fn(),
};
