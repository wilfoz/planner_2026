import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';

import { ConflictError } from '@/shared/errors/conflict.error';

@Catch(ConflictError)
export class ConflictErrorFilter implements ExceptionFilter {
  catch(exception: ConflictError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    response.status(HttpStatus.CONFLICT).send({
      statusCode: HttpStatus.CONFLICT,
      message: exception.message,
    });
  }
}

