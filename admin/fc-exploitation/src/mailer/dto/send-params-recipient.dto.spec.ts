import 'reflect-metadata';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { SendParamsRecipient } from './send-params-recipient.dto';

describe('SendParamsRecipient (Data Transfer Object)', () => {
  const baseMessage = {
    Email: 'valid@email.com',
    Name: 'validName',
  };

  it('Should validate if both ( email and name ) properies are string', async () => {
    // When | Action
    const messagetoCLass = plainToClass(SendParamsRecipient, baseMessage);
    const result = await validate(messagetoCLass);

    // Then | Assert
    expect(result).toEqual([]);
  });

  it('Should not validate if name is not a string', async () => {
    // Given | Setup
    const customMessage = { ...baseMessage, Name: 4 };

    // When | Action
    const messagetoCLass = plainToClass(SendParamsRecipient, customMessage);
    const errors = await validate(messagetoCLass);

    // Then | Assert
    expect(errors).not.toEqual([]);
    expect(errors).toEqual([
      {
        children: [],
        constraints: { isString: 'Name must be a string' },
        property: 'Name',
        target: {
          Email: 'valid@email.com',
          Name: 4,
        },
        value: 4,
      },
    ]);
  });

  it('Should not validate if email is not a valid email', async () => {
    // Given | Setup
    const customMessage = { ...baseMessage, Email: 4 };

    // When | Action
    const messagetoCLass = plainToClass(SendParamsRecipient, customMessage);
    const errors = await validate(messagetoCLass);

    // Then | Assert
    expect(errors).not.toEqual([]);
    expect(errors).toEqual([
      {
        children: [],
        constraints: { isEmail: 'Email must be an email' },
        property: 'Email',
        target: {
          Email: 4,
          Name: 'validName',
        },
        value: 4,
      },
    ]);
  });
});
