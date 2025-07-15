import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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
        // In case of validation error, we render the redirect with the flashed errors and DTO
        return of(error.message).pipe(
          map(({ message }) => message),
          map(validationErrors => {
            return validationErrors.reduce(
              (validationErrorsObject, validationError) => ({
                ...validationErrorsObject,
                [validationError.property]: Object.values(
                  validationError.constraints,
                ),
              }),
              {},
            );
          }),
          map(errors => {
            req.flash('errors', errors);
            req.flash('values', dto);
            return res.redirect(redirectURL);
          }),
        );
      }),
    );
  }
}
