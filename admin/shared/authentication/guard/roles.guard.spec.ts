import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  const createReflector = (roles): Reflector => ({
    get: jest.fn().mockReturnValue(roles),
    getAll: jest.fn(),
    getAllAndMerge: jest.fn(),
    getAllAndOverride: jest.fn(),
  });
  const createContext = (user): ExecutionContext => ({
    getHandler: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        user,
      }),
    }),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getClass: jest.fn(),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    getType: jest.fn().mockReturnValue('http'),
  });

  it('lets the request pass if no role is specified', () => {
    const reflector = createReflector(null);
    const context = createContext('Jean moust');
    const rolesGuard = new RolesGuard(reflector);

    const canActivate = rolesGuard.canActivate(context);

    expect(canActivate).toBeTruthy();
  });

  it('blocks the request if the user is not authenticated and some roles are defined', () => {
    const roles = ['carpenter'];
    const reflector = createReflector(roles);
    const context = createContext(null);

    const rolesGuard = new RolesGuard(reflector);

    const canActivate = rolesGuard.canActivate(context);

    expect(canActivate).toBeFalsy();
  });

  it('blocks the request if the user has not one of the required roles', () => {
    const roles = ['carpenter'];
    const reflector = createReflector(roles);
    const user = {
      roles: ['waiter'],
    };
    const context = createContext(user);

    const rolesGuard = new RolesGuard(reflector);
    const canActivate = rolesGuard.canActivate(context);

    expect(canActivate).toBeFalsy();
  });

  it('lets the request pass if the user has one of the required roles', () => {
    const roles = ['carpenter', 'police-officer'];
    const reflector = createReflector(roles);
    const user = {
      roles: ['police-officer'],
    };
    const context = createContext(user);

    const rolesGuard = new RolesGuard(reflector);
    const canActivate = rolesGuard.canActivate(context);

    expect(canActivate).toBeTruthy();
  });

  it('lets the request pass if the user has all of the required roles', () => {
    const roles = ['carpenter', 'police-officer'];
    const reflector = createReflector(roles);
    const user = {
      roles: ['police-officer', 'carpenter'],
    };
    const context = createContext(user);

    const rolesGuard = new RolesGuard(reflector);
    const canActivate = rolesGuard.canActivate(context);

    expect(canActivate).toBeTruthy();
  });
});
