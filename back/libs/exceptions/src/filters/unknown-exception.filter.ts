import {
  ArgumentsHost,
  Catch,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";

import { HttpExceptionFilter } from "./http-exception.filter";

@Catch()
@Injectable()
export class UnknownExceptionFilter extends HttpExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const wrapped = new InternalServerErrorException(exception);

    super.catch(wrapped, host);
  }
}
