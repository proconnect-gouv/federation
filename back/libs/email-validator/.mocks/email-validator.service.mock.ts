import type { EmailValidatorService } from '@fc/email-validator/services';

export function getEmailValidatorMock(): Record<
  keyof EmailValidatorService,
  jest.Mock
> {
  return { validate: jest.fn() };
}
