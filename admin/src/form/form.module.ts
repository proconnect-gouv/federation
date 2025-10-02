import { Module } from '@nestjs/common';
import { FormErrorsInterceptor } from './interceptor/form-errors.interceptor';

@Module({
  providers: [FormErrorsInterceptor],
  exports: [FormErrorsInterceptor],
})
export class FormModule {}
