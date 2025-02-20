import { Test, TestingModule } from '@nestjs/testing';

import { Form, Input } from '../decorators';
import { $IsNotEmpty, $IsString } from '../descriptors';
import { Dto2FormInvalidMetadataException } from '../exceptions';
import { MetadataFormService } from './metadata-form.service';

describe('MetadataFormService', () => {
  let service: MetadataFormService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [MetadataFormService],
    }).compile();

    service = module.get<MetadataFormService>(MetadataFormService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDtoMetadata', () => {
    it('should return metadata for a valid DTO when input is an array', () => {
      // Given
      @Form()
      class TestDtoWithoutRequired {
        @Input({
          order: 0,
          array: true,
          validators: [$IsString(), $IsNotEmpty()],
        })
        given_name: string;
      }

      const expectedMockMetadata = [
        {
          required: false,
          array: true,
          readonly: false,
          order: 0,
          initialValue: [''],
          validators: [
            {
              name: 'isString',
              errorLabel: 'isString_error',
              validationArgs: [],
            },
            {
              name: 'isNotEmpty',
              errorLabel: 'isNotEmpty_error',
              validationArgs: [],
            },
          ],
          validateIf: [],
          type: 'text',
          name: 'given_name',
        },
      ];

      // When
      const metadata = service.getDtoMetadata(TestDtoWithoutRequired);

      // Then
      expect(metadata).toEqual(expectedMockMetadata);
    });

    it('should return metadata for a valid DTO when input is required', () => {
      // Given
      @Form()
      class TestDtoWithRequired {
        @Input({
          required: true,
          order: 0,
          validators: [$IsString(), $IsNotEmpty()],
        })
        given_name: string;
      }

      const expectedMockMetadata = [
        {
          required: true,
          array: false,
          readonly: false,
          order: 0,
          initialValue: '',
          validators: [
            {
              name: 'isFilled',
              errorLabel: 'isFilled_error',
              validationArgs: [],
            },
            {
              name: 'isString',
              errorLabel: 'isString_error',
              validationArgs: [],
            },
            {
              name: 'isNotEmpty',
              errorLabel: 'isNotEmpty_error',
              validationArgs: [],
            },
          ],
          validateIf: [],
          type: 'text',
          name: 'given_name',
        },
      ];

      // When
      const metadata = service.getDtoMetadata(TestDtoWithRequired);

      // Then
      expect(metadata).toEqual(expectedMockMetadata);
    });

    it('should return metadata for a valid DTO when input is readonly', () => {
      // Given
      @Form()
      class TestDtoWithRequired {
        @Input({
          readonly: true,
          order: 0,
          validators: [$IsString()],
        })
        given_name: string;
      }

      const expectedMockMetadata = [
        {
          required: false,
          array: false,
          readonly: true,
          order: 0,
          initialValue: '',
          validators: [
            {
              name: 'isString',
              errorLabel: 'isString_error',
              validationArgs: [],
            },
          ],
          validateIf: [],
          type: 'text',
          name: 'given_name',
        },
      ];

      // When
      const metadata = service.getDtoMetadata(TestDtoWithRequired);

      // Then
      expect(metadata).toEqual(expectedMockMetadata);
    });

    it('should throw an error if no metadata is found for the DTO', () => {
      // Given
      @Form()
      class TestDto {
        @Input({
          order: 0,
          validators: [$IsString(), $IsNotEmpty()],
        })
        given_name: string;
      }

      jest.spyOn(Reflect, 'getMetadata').mockReturnValue(undefined);

      // Vérifier que la méthode lance une erreur si aucune métadonnée n'est trouvée
      expect(() => service.getDtoMetadata(TestDto)).toThrow(
        Dto2FormInvalidMetadataException,
      );
    });
  });
});
