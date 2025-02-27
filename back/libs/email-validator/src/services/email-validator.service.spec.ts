import { getLoggerMock } from '@mocks/logger';

import { EmailValidatorService } from './email-validator.service';

describe(EmailValidatorService.name, () => {
  describe(EmailValidatorService.prototype.validate.name, () => {
    it('should return true if send_transactional is 1', async () => {
      const service = new EmailValidatorService(
        getLoggerMock() as any,
        jest.fn().mockResolvedValue({
          send_transactional: '1',
        }),
      );

      await expect(
        service.validate('debounce+foo@bar.com'),
      ).resolves.toBeTrue();
    });

    it('should return false if send_transactional is not 1', async () => {
      const service = new EmailValidatorService(
        getLoggerMock() as any,
        jest.fn().mockResolvedValue({
          send_transactional: '🃏',
        }),
      );

      await expect(
        service.validate('debounce+foo@bar.com'),
      ).resolves.toBeFalse();
    });

    it('❎ should return true if the email does not start with debounce+', async () => {
      const service = new EmailValidatorService(
        getLoggerMock() as any,
        jest.fn().mockRejectedValueOnce(new Error('💥')),
      );

      await expect(service.validate('foo@bar.com')).resolves.toBeTrue();
    });

    it('❎ should return true if a singleValidation error occurs', async () => {
      const service = new EmailValidatorService(
        getLoggerMock() as any,
        jest.fn().mockRejectedValueOnce(new Error('💥')),
      );

      await expect(
        service.validate('debounce+foo@bar.com'),
      ).resolves.toBeTrue();
    });
  });
});
