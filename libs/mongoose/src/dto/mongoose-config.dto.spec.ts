import { validateDto } from '@fc/common';
import { MongooseConfig } from './mongoose-config.dto';
import { validationOptions } from '@fc/config';

describe('MongooseConfig', () => {
  const correctObjectMock = {
    user: 'user',
    password: 'password',
    hosts: 'hosts',
    database: 'database',
    options: '',
  };

  describe('global validation', () => {
    it('Should validate correctObjectMock', async () => {
      // When
      const errors = await validateDto(
        correctObjectMock,
        MongooseConfig,
        validationOptions,
      );

      // Then
      expect(errors).toEqual([]);
    });
  });

  describe('global error', () => {
    it('Should return several errors if empties keys', async () => {
      // Given
      const objectMock = {
        ...correctObjectMock,
        user: '',
        password: '',
      };

      // when
      const errors = await validateDto(
        objectMock,
        MongooseConfig,
        validationOptions,
      );

      // Then
      expect(errors).toHaveLength(2);
      expect(errors[0].property).toBe('user');
      expect(errors[1].property).toBe('password');
    });
  });

  describe('user', () => {
    it('Should not accept an empty user', async () => {
      // Given
      const objectMock = {
        ...correctObjectMock,
        user: '',
      };

      // When
      const errors = await validateDto(
        objectMock,
        MongooseConfig,
        validationOptions,
      );

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('user');
    });

    it('Should not accept a non string user', async () => {
      // Given
      const objectMock = {
        ...correctObjectMock,
        user: 123,
      };

      // When
      const errors = await validateDto(
        objectMock,
        MongooseConfig,
        validationOptions,
      );

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('user');
    });
  });

  describe('password', () => {
    it('Should not accept an empty password', async () => {
      // Given
      const objectMock = {
        ...correctObjectMock,
        password: '',
      };

      // When
      const errors = await validateDto(
        objectMock,
        MongooseConfig,
        validationOptions,
      );

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
    });

    it('Should not accept a non string password', async () => {
      // Given
      const objectMock = {
        ...correctObjectMock,
        password: 123,
      };

      // When
      const errors = await validateDto(
        objectMock,
        MongooseConfig,
        validationOptions,
      );

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
    });
  });

  describe('hosts', () => {
    it('Should not accept an empty hosts', async () => {
      // Given
      const objectMock = {
        ...correctObjectMock,
        hosts: '',
      };

      // When
      const errors = await validateDto(
        objectMock,
        MongooseConfig,
        validationOptions,
      );

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('hosts');
    });

    it('Should not accept a non string hosts', async () => {
      // Given
      const objectMock = {
        ...correctObjectMock,
        hosts: 123,
      };

      // When
      const errors = await validateDto(
        objectMock,
        MongooseConfig,
        validationOptions,
      );

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('hosts');
    });
  });

  describe('database', () => {
    it('Should not accept an empty database', async () => {
      // Given
      const objectMock = {
        ...correctObjectMock,
        database: '',
      };

      // When
      const errors = await validateDto(
        objectMock,
        MongooseConfig,
        validationOptions,
      );

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('database');
    });

    it('Should not accept a non string database', async () => {
      // Given
      const objectMock = {
        ...correctObjectMock,
        database: 123,
      };

      // When
      const errors = await validateDto(
        objectMock,
        MongooseConfig,
        validationOptions,
      );

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('database');
    });
  });

  describe('options', () => {
    it('Should not accept a non string options', async () => {
      // Given
      const objectMock = {
        ...correctObjectMock,
        options: 123,
      };

      // When
      const errors = await validateDto(
        objectMock,
        MongooseConfig,
        validationOptions,
      );

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('options');
    });
  });
});
