import type {
    ErrorRequestHandler,
    RequestHandler
} from 'express';

import { AppError }
    from '../errors/AppError';

import { sendError }
    from '../shared/api-response';

export const notFoundHandler: RequestHandler =
    (req, res): void => {

        sendError(
            res,
            404,
            `Ruta ${req.method} ${req.originalUrl} no encontrada`
        );
    };

export const errorHandler: ErrorRequestHandler =
    (
        error,
        _req,
        res,
        _next
    ): void => {

        if (error instanceof AppError) {

            sendError(
                res,
                error.statusCode,
                error.message,
                error.details
            );

            return;
        }

        console.error(
            '❌ Error no controlado:',
            error
        );

        sendError(
            res,
            500,
            'Error interno del servidor'
        );
    };