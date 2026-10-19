import type {
    Request,
    Response
} from 'express';

import {
    EmpleadosController
} from './empleados.controllers';

import type {
    IEmployeeRepository
} from '../repositories/IEmployeeRepository';

import type {
    CreateEmployeeDto,
    EmployeeIdParams
} from '../dtos/employee.dto';


describe(
    '🧪 EmpleadosController - Modularidad y Testabilidad',
    () => {

        let controller: EmpleadosController;

        let mockRepository:
            jest.Mocked<IEmployeeRepository>;

        let mockResponse:
            Partial<Response>;

        let statusMock:
            jest.Mock;

        let jsonMock:
            jest.Mock;


        beforeEach(() => {

            /*
             * ==========================================
             * MOCK DEL REPOSITORY
             * ==========================================
             *
             * Se simula IEmployeeRepository.
             *
             * No se utiliza:
             * - MongoDB
             * - Mongoose
             * - Docker
             *
             * Esto demuestra el desacoplamiento
             * del Controller respecto a la
             * infraestructura de persistencia.
             */
            mockRepository = {

                findAll:
                    jest.fn(),

                findById:
                    jest.fn(),

                create:
                    jest.fn(),

                update:
                    jest.fn(),

                delete:
                    jest.fn()
            };


            /*
             * Se inyecta el Repository simulado
             * en el Controller.
             */
            controller =
                new EmpleadosController(
                    mockRepository
                );


            /*
             * ==========================================
             * MOCK DE RESPONSE DE EXPRESS
             * ==========================================
             */

            jsonMock =
                jest.fn();

            statusMock =
                jest
                    .fn()
                    .mockReturnValue({
                        json: jsonMock
                    });


            mockResponse = {
                status:
                statusMock
            };

        });


        /*
         * ==========================================
         * TEST 1
         *
         * GET CORRECTO
         *
         * Debe:
         * - consultar Repository
         * - responder HTTP 200
         * - devolver Response Wrapper
         * ==========================================
         */
        it(
            '✅ debería obtener empleados desde la abstracción y responder 200',
            async () => {

                const fakeEmployees = [
                    {
                        id:
                            '1',

                        nombre:
                            'Andrés Mendoza',

                        cargo:
                            'Arquitecto',

                        departamento:
                            'TI',

                        sueldo:
                            4000
                    }
                ];


                /*
                 * Simulamos la respuesta
                 * de la capa Repository.
                 */
                mockRepository
                    .findAll
                    .mockResolvedValue(
                        fakeEmployees
                    );


                /*
                 * Para getEmpleados no se necesitan
                 * parámetros ni body.
                 */
                const request =
                    {} as Request;


                await controller
                    .getEmpleados(
                        request,
                        mockResponse as Response
                    );


                /*
                 * Comprobamos que el Repository
                 * fue llamado exactamente una vez.
                 */
                expect(
                    mockRepository
                        .findAll
                )
                    .toHaveBeenCalledTimes(
                        1
                    );


                /*
                 * Comprobamos HTTP 200.
                 */
                expect(
                    statusMock
                )
                    .toHaveBeenCalledWith(
                        200
                    );


                /*
                 * Comprobamos el Response Wrapper.
                 */
                expect(
                    jsonMock
                )
                    .toHaveBeenCalledWith({
                        success:
                            true,

                        message:
                            'Empleados obtenidos correctamente',

                        data:
                        fakeEmployees
                    });

            }
        );


        /*
         * ==========================================
         * TEST 2
         *
         * POST CORRECTO
         *
         * Debe:
         * - recibir empleado válido
         * - llamar repository.create()
         * - responder HTTP 201
         * ==========================================
         */
        it(
            '✅ debería crear un empleado válido y responder 201',
            async () => {

                /*
                 * Datos que llegarían
                 * desde una petición HTTP válida.
                 */
                const nuevoEmpleado:
                    CreateEmployeeDto = {

                    nombre:
                        'Hugo Saldarriaga',

                    cargo:
                        'Software Developer',

                    departamento:
                        'TI',

                    sueldo:
                        2500
                };


                /*
                 * Empleado simulado después
                 * de ser creado por Repository.
                 */
                const empleadoCreado = {

                    id:
                        'employee-001',

                    ...nuevoEmpleado
                };


                /*
                 * Configuramos el Mock.
                 */
                mockRepository
                    .create
                    .mockResolvedValue(
                        empleadoCreado
                    );


                /*
                 * El Controller addEmpleado utiliza:
                 *
                 * Request<
                 *   Record<string, never>,
                 *   unknown,
                 *   CreateEmployeeDto
                 * >
                 *
                 * Por eso construimos el Request
                 * con exactamente ese contrato.
                 */
                const request = {

                    body:
                    nuevoEmpleado

                } as Request<
                    Record<string, never>,
                    unknown,
                    CreateEmployeeDto
                >;


                await controller
                    .addEmpleado(
                        request,
                        mockResponse as Response
                    );


                /*
                 * Repository.create()
                 * debe ejecutarse una vez.
                 */
                expect(
                    mockRepository
                        .create
                )
                    .toHaveBeenCalledTimes(
                        1
                    );


                /*
                 * Debe recibir exactamente
                 * los datos enviados.
                 */
                expect(
                    mockRepository
                        .create
                )
                    .toHaveBeenCalledWith(
                        nuevoEmpleado
                    );


                /*
                 * Un recurso creado correctamente
                 * debe responder HTTP 201.
                 */
                expect(
                    statusMock
                )
                    .toHaveBeenCalledWith(
                        201
                    );


                /*
                 * Verificamos el Response Wrapper.
                 */
                expect(
                    jsonMock
                )
                    .toHaveBeenCalledWith({

                        success:
                            true,

                        message:
                            'Empleado creado correctamente',

                        data:
                        empleadoCreado
                    });

            }
        );


        /*
         * ==========================================
         * TEST 3
         *
         * GET INCORRECTO
         *
         * El ID tiene una estructura válida,
         * pero Repository indica que
         * el empleado NO existe.
         *
         * Resultado esperado:
         * AppError 404
         * ==========================================
         */
        it(
            '❌ debería lanzar 404 cuando el empleado no existe',
            async () => {

                /*
                 * Simulamos que Repository
                 * no encontró ningún registro.
                 */
                mockRepository
                    .findById
                    .mockResolvedValue(
                        null
                    );


                /*
                 * EmployeeIdParams exige:
                 *
                 * {
                 *   id: string
                 * }
                 *
                 * Por eso usamos
                 * Request<EmployeeIdParams>.
                 */
                const request = {

                    params: {
                        id:
                            'empleado-no-existe'
                    }

                } as Request<
                    EmployeeIdParams
                >;


                /*
                 * El Controller debe lanzar
                 * un AppError 404.
                 */
                await expect(

                    controller
                        .getEmpleadoById(
                            request,
                            mockResponse as Response
                        )

                )
                    .rejects
                    .toMatchObject({

                        statusCode:
                            404,

                        message:
                            'Empleado no encontrado'
                    });


                /*
                 * Verificamos que se consultó
                 * el ID correcto.
                 */
                expect(
                    mockRepository
                        .findById
                )
                    .toHaveBeenCalledWith(
                        'empleado-no-existe'
                    );


                /*
                 * Solo debe consultar una vez.
                 */
                expect(
                    mockRepository
                        .findById
                )
                    .toHaveBeenCalledTimes(
                        1
                    );

            }
        );

    }
);