import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Observable, of, from } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { FormValidationErrorsDto } from '../dto/form-validation-errors.dto';
import { validate, validateSync, ValidationError } from 'class-validator';

export class FormErrorsInterceptor implements NestInterceptor {
  /**
   * For the redirection, you need to have the redirect get handler
   * @param {string} private readonly redirectTemplateURL [description]
   */
  constructor(private readonly redirectTemplateURL: string) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const dto = req.body;

    let redirectURL = `${res.locals.APP_ROOT}${this.redirectTemplateURL}`;

    // Replace params keys in redirect uri with the corresponding value
    for (const param in req.params) {
      if (req.params.hasOwnProperty(param)) {
        redirectURL = redirectURL.replace(`:${param}`, req.params[param]);
      }
    }

    // If the totp middleware is present, we check the result
    if (req.totp && req.totp === 'invalid') {
      req.flash('errors', { _totp: ["Le TOTP saisi n'est pas valide"] });
      req.flash('values', dto);
      return new Observable(res.redirect(redirectURL));
    }

    return next.handle().pipe(
      catchError(error => {
        const formValidationErrors = plainToClass(
          FormValidationErrorsDto,
          error.response,
        );

        const formValidationErrorsErrors = validateSync(formValidationErrors);

        if (formValidationErrorsErrors.length > 0) {
          return next.handle();
        }

        const flashErrors = formValidationErrors.message
          .map(validationError => ({
            property: validationError.property,
            constraints: validationError.constraints
              ? Object.values(validationError.constraints)
              : [],
          }))
          .reduce(
            (acc, currentValidationError) => ({
              ...acc,
              [currentValidationError.property]:
                currentValidationError.constraints,
            }),
            {},
          );

        req.flash('errors', flashErrors);
        req.flash('values', dto);
        return new Observable(res.redirect(redirectURL));
      }),
    );
  }
}
