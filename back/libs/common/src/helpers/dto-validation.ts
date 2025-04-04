import 'reflect-metadata';

import {
  ClassTransformOptions,
  instanceToPlain,
  plainToInstance,
} from 'class-transformer';
import {
  validate,
  validateSync,
  ValidationError,
  ValidatorOptions,
} from 'class-validator';

import { Type } from '@nestjs/common';

/**
 * @todo #428  Supprimer les Type<> et créer un InstanceOf<> identique mais
 * indépendant de NestJS
 * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/428
 */
export function getTransformed<T = any>(
  plain: object,
  dto: Type<any>,
  options?: ClassTransformOptions,
): T {
  return plainToInstance(dto, plain, options);
}

export async function validateDto(
  plain: object,
  dto: Type<any>,
  validatorOptions: ValidatorOptions,
  transformOptions?: ClassTransformOptions,
): Promise<ValidationError[]> {
  const object = getTransformed<typeof dto>(plain, dto, transformOptions);

  /**
   *  @todo
   *    author: Arnaud
   *    date: 19/03/2020
   *    ticket: FC-244 (identity, DTO, Validate)
   *
   *    context: On n'utilise pas l'objet transformé !
   *    problem: on valide l'object transformé mais on ne récupère pas l'objet transformé et donc nettoyé des inconnues
   *    action: renvoyer un objet contenant résultat ou erreurs éventuelles.
   */
  return await validate(object, validatorOptions);
}

export function validateDtoSync(
  plain: object,
  dto: Type<any>,
  validatorOptions: ValidatorOptions,
  transformOptions?: ClassTransformOptions,
): ValidationError[] {
  const object = getTransformed<typeof dto>(plain, dto, transformOptions);

  /**
   *  @todo
   *    author: Arnaud
   *    date: 19/03/2020
   *    ticket: FC-244 (identity, DTO, Validate)
   *
   *    context: On n'utilise pas l'objet transformé !
   *    problem: on valide l'object transformé mais on ne récupère pas l'objet transformé et donc nettoyé des inconnues
   *    action: renvoyer un objet contenant résultat ou erreurs éventuelles.
   */
  return validateSync(object, validatorOptions);
}

/**
 * function to transform and validate raw data.
 * @param plain Data to transform and validate
 * @param dto the Dto to validate and transform data
 * @param validatorOptions options for the validator process
 * @param transformOptions options for the transform process
 * @returns
 */
export async function filteredByDto<T = any>(
  plain: object,
  dto: Type<T>,
  validatorOptions: ValidatorOptions,
  transformOptions?: ClassTransformOptions,
): Promise<{ errors: ValidationError[]; result: T }> {
  const data = getTransformed<typeof dto>(plain, dto, transformOptions);
  const errors = await validate(data, validatorOptions);
  if (errors.length) {
    return { errors, result: null };
  }
  const result = instanceToPlain(data) as T;
  return { errors, result };
}
