import type {
    Request,
    Response
} from 'express';

import {
    createEmployeeSchema
} from '../dtos/employee.dto';

import {
    AppError
} from '../errors/AppError';

import {
    validateRequest
} from './validation.middleware';


describe(
    '🧪 Validación Zod - Petición incorrecta',
    () => {

        let mockResponse:
            Partial<Response>;

        /*
         * Usamos jest.Mock directamente.
         *
         * Esto evita el conflicto de tipos
         * provocado por las sobrecargas
         * de NextFunction en Express 5.
         */
        let nextMock:
            jest.Mock;


        beforeEach(() => {

            mockResponse = {};

            nextMock =
                jest.fn();

        });


        /*
         * ==========================================
         * TEST 4
         *
         * PETICIÓN INCORRECTA
         *
         * El payload contiene:
         *
         * - nombre demasiado corto
         * - sueldo negativo
         *
         * Zod debe rechazar la petición
         * antes de llegar al Controller
         * o Repository.
         *
         * Resultado esperado:
         * AppError 400
         * ==========================================
         */
        it(
            '❌ debería rechazar una petición inválida con error 400',
            () => {

                const payloadInvalido = {

                    /*
                     * El DTO exige mínimo
                     * 2 caracteres.
                     */
                    nombre:
                        'A',

                    cargo:
                        'Developer',

                    departamento:
                        'TI',

                    /*
                     * El DTO no permite
                     * sueldo negativo.
                     */
                    sueldo:
                        -500
                };


                const mockRequest = {

                    body:
                    payloadInvalido

                } as Partial<Request>;


                /*
                 * Creamos el middleware
                 * utilizando el esquema Zod
                 * de creación de empleados.
                 */
                const middleware =
                    validateRequest({

                        body:
                        createEmployeeSchema
                    });


                /*
                 * Ejecutamos manualmente
                 * el middleware.
                 */
                middleware(

                    mockRequest as Request,

                    mockResponse as Response,

                    nextMock
                );


                /*
                 * El middleware debe haber
                 * llamado next() exactamente
                 * una vez.
                 */
                expect(
                    nextMock
                )
                    .toHaveBeenCalledTimes(
                        1
                    );


                /*
                 * Recuperamos el argumento
                 * que fue enviado a next().
                 *
                 * Ese argumento debe ser
                 * nuestro AppError.
                 */
                const error =
                    nextMock
                        .mock
                        .calls[0][0];


                /*
                 * Verificamos que realmente
                 * sea una instancia de AppError.
                 */
                expect(
                    error
                )
                    .toBeInstanceOf(
                        AppError
                    );


                /*
                 * Después de comprobar
                 * instanceof, podemos tratarlo
                 * como AppError.
                 */
                const appError =
                    error as AppError;


                /*
                 * Comprobamos HTTP 400.
                 */
                expect(
                    appError.statusCode
                )
                    .toBe(
                        400
                    );


                /*
                 * Comprobamos el mensaje
                 * utilizado por nuestro middleware.
                 */
                expect(
                    appError.message
                )
                    .toBe(
                        'Datos de solicitud inválidos'
                    );


                /*
                 * Zod debe incluir información
                 * de los campos que fallaron.
                 */
                expect(
                    appError.details
                )
                    .toBeDefined();

            }
        );

    }
);