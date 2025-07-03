import 'reflect-metadata';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

import { Message } from './message.dto';

describe('Message (Data Transfer Object)', () => {
  const baseMessage = {
    From: {
      Email: 'valid@email.com',
      Name: 'validName',
    },
    To: [
      {
        Email: 'valid@email.com',
        Name: 'validName',
      },
    ],
    Subject: 'subject',
  };

  // Mandatory fields of DTO
  it('Should validate if both ( From, To and Subject ) properies', async () => {
    // When | Action
    const messagetoCLass = plainToClass(Message, baseMessage);
    const result = await validate(messagetoCLass);

    // Then | Assert
    expect(result).toEqual([]);
  });

  it('Should not validate if To is not a string', async () => {
    // Given | Setup
    const customMessage = { ...baseMessage, To: 4 };

    // When | Action
    const messagetoCLass = plainToClass(Message, customMessage);
    const errors = await validate(messagetoCLass);

    // Then | Assert
    expect(errors).not.toEqual([]);
    expect(errors[0].constraints).toEqual({ isArray: 'To must be an array' });
  });

  it('Should not validate if From is not a valid email', async () => {
    // Given | Setup
    const customMessage = { ...baseMessage, From: 4 };

    // When | Action
    const messagetoCLass = plainToClass(Message, customMessage);
    const errors = await validate(messagetoCLass);

    // Then | Assert
    expect(errors).not.toEqual([]);
    expect(errors[0].children[0].constraints).toEqual({
      nestedValidation: 'nested property From must be either object or array',
    });
  });

  it('Should not validate if Subject is not a valid string', async () => {
    // Given | Setup
    const customMessage = { ...baseMessage, Subject: 4 };

    // When | Action
    const messagetoCLass = plainToClass(Message, customMessage);
    const errors = await validate(messagetoCLass);

    // Then | Assert
    expect(errors).not.toEqual([]);
    expect(errors[0].constraints).toEqual({
      isString: 'Subject must be a string',
    });
  });

  // Optional fields of DTO
  it('Should validate if HTMLPart is a valid string', async () => {
    // Given | Setup
    const customMessage = { ...baseMessage, HTMLPart: 'HTMLPart' };

    // When | Action
    const messagetoCLass = plainToClass(Message, customMessage);
    const result = await validate(messagetoCLass);

    // Then | Assert
    expect(result).toEqual([]);
  });

  it('Should not validate if HTMLPart is not a valid string', async () => {
    // Given | Setup
    const customMessage = { ...baseMessage, HTMLPart: 4 };

    // When | Action
    const messagetoCLass = plainToClass(Message, customMessage);
    const errors = await validate(messagetoCLass);

    // Then | Assert
    expect(errors).not.toEqual([]);
    expect(errors[0].constraints).toEqual({
      isString: 'HTMLPart must be a string',
    });
  });
});
