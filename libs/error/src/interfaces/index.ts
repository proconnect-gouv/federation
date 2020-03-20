/**
 * Re export Nestjs built in HttpException
 * to make it easier to import exceptions in other modules
 * ie: we always import error interfaces from @fc/error
 */
export { HttpException } from '@nestjs/common';
export * from './fc.exception';
