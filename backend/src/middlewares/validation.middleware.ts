import type {
    NextFunction,
    Request,
    Response
} from 'express';

import type { ZodType } from 'zod';

import { AppError }
    from '../errors/AppError';

interface RequestSchemas {
    body?: ZodType;
    params?: ZodType;
}

export const validateRequest = (
    schemas: RequestSchemas
) => {

    return (
        req: Request,
        _res: Response,
        next: NextFunction
    ): void => {

        if (schemas.params) {

            const result =
                schemas.params.safeParse(req.params);

            if (!result.success) {
                next(
                    new AppError(
                        400,
                        'Parámetros de solicitud inválidos',
                        result.error.flatten()
                    )
                );

                return;
            }

            req.params =
                result.data as typeof req.params;
        }

        if (schemas.body) {

            const result =
                schemas.body.safeParse(req.body);

            if (!result.success) {
                next(
                    new AppError(
                        422,
                        'Datos de solicitud inválidos',
                        result.error.flatten()
                    )
                );

                return;
            }

            req.body = result.data;
        }

        next();
    };
};