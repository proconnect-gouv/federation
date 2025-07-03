import 'reflect-metadata';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { Attachements } from './attachments.dto';

describe('Attachements (Data Transfer Object)', () => {
  const baseMessage = {
    ContentType: 'contentType',
    Filename: 'fileName',
    Base64Content: 'Base64Content',
  };

  it('Should validate if all ( ContentType, Filename and Base64Content ) properies are string', async () => {
    // When | Action
    const messagetoCLass = plainToClass(Attachements, baseMessage);
    const result = await validate(messagetoCLass);

    // Then | Assert
    expect(result).toEqual([]);
  });

  it('Should not validate if ContentType is not a string', async () => {
    // Given | Setup
    const customMessage = { ...baseMessage, ContentType: 4 };

    // When | Action
    const messagetoCLass = plainToClass(Attachements, customMessage);
    const errors = await validate(messagetoCLass);

    // Then | Assert
    expect(errors).not.toEqual([]);
    expect(errors).toEqual([
      {
        children: [],
        constraints: { isString: 'ContentType must be a string' },
        property: 'ContentType',
        target: {
          Base64Content: 'Base64Content',
          ContentType: 4,
          Filename: 'fileName',
        },
        value: 4,
      },
    ]);
  });

  it('Should not validate if Filename is not a string', async () => {
    // Given | Setup
    const customMessage = { ...baseMessage, Filename: 4 };

    // When | Action
    const messagetoCLass = plainToClass(Attachements, customMessage);
    const errors = await validate(messagetoCLass);

    // Then | Assert
    expect(errors).not.toEqual([]);
    expect(errors).toEqual([
      {
        children: [],
        constraints: { isString: 'Filename must be a string' },
        property: 'Filename',
        target: {
          Base64Content: 'Base64Content',
          ContentType: 'contentType',
          Filename: 4,
        },
        value: 4,
      },
    ]);
  });

  it('Should not validate if Base64Content is not a valid string', async () => {
    // Given | Setup
    const customMessage = { ...baseMessage, Base64Content: 4 };

    // When | Action
    const messagetoCLass = plainToClass(Attachements, customMessage);
    const errors = await validate(messagetoCLass);

    // Then | Assert
    expect(errors).not.toEqual([]);
    expect(errors).toEqual([
      {
        children: [],
        constraints: { isString: 'Base64Content must be a string' },
        property: 'Base64Content',
        target: {
          Base64Content: 4,
          ContentType: 'contentType',
          Filename: 'fileName',
        },
        value: 4,
      },
    ]);
  });
});
