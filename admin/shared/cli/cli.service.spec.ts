import { Test, TestingModule } from '@nestjs/testing';
import { ConsoleModule } from 'nestjs-console';
import { UserService } from '@fc/shared/user/user.service';
import { CliService } from './cli.service';

describe('CliService', () => {
  let service: CliService;
  let userServiceMock: any;
  let totpServiceMock: any;
  let consoleLogMock: any;
  let consoleErrorMock: any;
  let processExitMock: any;

  beforeEach(async () => {
    jest.restoreAllMocks();

    userServiceMock = {
      generateTmpPass: jest.fn(),
      createUser: jest.fn(),
    };

    totpServiceMock = {
      generateTotpSecret: jest.fn(),
    };

    consoleLogMock = jest.spyOn(console, 'log');

    consoleErrorMock = jest.spyOn(console, 'error');

    processExitMock = jest
      .spyOn(process, 'exit')
      .mockImplementation(code => code as never);

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConsoleModule],
      providers: [
        CliService,
        UserService,
        { provide: 'UserService', useValue: userServiceMock },
        { provide: 'TotpService', useValue: totpServiceMock },
      ],
      exports: [CliService],
    }).compile();
    service = module.get<CliService>(CliService);

    jest.resetAllMocks();
  });

  describe('createUser', () => {
    it('Should return Password on success', async () => {
      // Given
      const name = 'john';
      const roles = 'admin';
      const email = 'jhon@doe.com';
      userServiceMock.generateTmpPass.mockReturnValueOnce('Azertyuio34!');
      totpServiceMock.generateTotpSecret.mockReturnValue('XXXXX');
      // When
      await service.createUser(name, email, roles);
      // Then
      expect(userServiceMock.generateTmpPass).toHaveBeenCalledTimes(1);
      expect(userServiceMock.createUser).toHaveBeenCalledTimes(1);

      expect(consoleLogMock).toHaveBeenCalledTimes(1);
      expect(consoleLogMock).toHaveBeenCalledWith('Azertyuio34!');

      expect(processExitMock).toHaveBeenCalledTimes(1);
      expect(processExitMock).toHaveBeenCalledWith(0);
    });

    it('Should return error on error', async () => {
      // Given
      const name = 'john';
      const roles = 'admin';
      const email = 'jhon@doe.com';
      userServiceMock.generateTmpPass.mockReturnValueOnce('Azertyuio34!');
      totpServiceMock.generateTotpSecret.mockReturnValue('XXXXX');
      // When
      userServiceMock.createUser.mockRejectedValueOnce({
        message: 'Something bad',
      });
      await service.createUser(name, email, roles);
      // Then
      expect(userServiceMock.generateTmpPass).toHaveBeenCalledTimes(1);
      expect(userServiceMock.createUser).toHaveBeenCalledTimes(1);

      expect(consoleLogMock).toHaveBeenCalledTimes(0);

      expect(consoleErrorMock).toHaveBeenCalledTimes(1);
      expect(consoleErrorMock).toHaveBeenCalledWith(`
        Impossible de créer le compte
        Message : Something bad
      `);

      expect(processExitMock).toHaveBeenCalledTimes(1);
      expect(processExitMock).toHaveBeenCalledWith(1);
    });
  });

  describe('formatValidationErrors', () => {
    it('Should return a flatten string of errors', () => {
      // Given
      const errors = [
        { constraints: { foo: 'bar' } },
        { constraints: { fizz: 'buzz' } },
      ];
      // When
      // Private method testing https://stackoverflow.com/a/35991491/1071169
      // tslint:disable-next-line no-string-literal
      const result = service['formatValidationErrors'](errors);
      // Then
      expect(result).toEqual('bar\nbuzz');
    });
  });

  describe('getRoles', () => {
    it('Should return roles prefixed by "inactive"', () => {
      // Given
      const input = 'admin,operator';
      // When
      // Private method testing https://stackoverflow.com/a/35991491/1071169
      // tslint:disable-next-line no-string-literal
      const roles = service['getRoles'](input);
      // Then
      expect(roles).toContain('inactive_admin');
      expect(roles).not.toContain('admin');
      expect(roles).toContain('inactive_operator');
      expect(roles).not.toContain('operator&');
    });

    it('Should append "new_account" role to the list', () => {
      // Given
      const input = 'admin,operator';
      // When
      // Private method testing https://stackoverflow.com/a/35991491/1071169
      // tslint:disable-next-line no-string-literal
      const roles = service['getRoles'](input);
      // Then
      expect(roles).toContain('new_account');
    });
  });
});
