import 'reflect-metadata';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { InlinedAttachments } from './inlined-attachments.dto';

describe('InlinedAttachments (Data Transfer Object)', () => {
  const baseMessage = {
    ContentType: 'contentType',
    Filename: 'fileName',
    ContentID: 'contentId',
    Base64Content: 'Base64Content',
  };

  it('Should validate if all ( ContentType, Filename, contentId and Base64Content ) properies are string', async () => {
    // When | Action
    const messagetoCLass = plainToClass(InlinedAttachments, baseMessage);
    const result = await validate(messagetoCLass);

    // Then | Assert
    expect(result).toEqual([]);
  });

  it('Should not validate if ContentType is not a string', async () => {
    // Given | Setup
    const customMessage = { ...baseMessage, ContentType: 4 };

    // When | Action
    const messagetoCLass = plainToClass(InlinedAttachments, customMessage);
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
          ContentID: 'contentId',
          ContentType: 4,
          Filename: 'fileName',
        },
        value: 4,
      },
    ]);
  });

  it('Should not validate if ContentID is not a string', async () => {
    // Given | Setup
    const customMessage = { ...baseMessage, ContentID: 4 };

    // When | Action
    const messagetoCLass = plainToClass(InlinedAttachments, customMessage);
    const errors = await validate(messagetoCLass);

    // Then | Assert
    expect(errors).not.toEqual([]);
    expect(errors).toEqual([
      {
        children: [],
        constraints: { isString: 'ContentID must be a string' },
        property: 'ContentID',
        target: {
          Base64Content: 'Base64Content',
          ContentID: 4,
          ContentType: 'contentType',
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
    const messagetoCLass = plainToClass(InlinedAttachments, customMessage);
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
          ContentID: 'contentId',
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
    const messagetoCLass = plainToClass(InlinedAttachments, customMessage);
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
          ContentID: 'contentId',
          ContentType: 'contentType',
          Filename: 'fileName',
        },
        value: 4,
      },
    ]);
  });
});
