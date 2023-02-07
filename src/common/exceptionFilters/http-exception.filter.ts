import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException | unknown, 
        host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        let status: number;
        
        if(exception instanceof HttpException) {
            status = exception.getStatus();
        }else if(exception instanceof (TypeError || SyntaxError)) {
            status = HttpStatus.NOT_FOUND;
        }else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        let errorMessage: string;
        if( exception instanceof HttpException ||
            exception instanceof Error){
            errorMessage = exception.message;
        }else {
            errorMessage = "unkwon Error Message";
        }
        console.error(exception);
        response.status(status).json({
            statusCode: status,
            //timestamp: new Date().toISOString(),
            //path: request.url,
            errorMessage
        });
    }
}