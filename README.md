# Práctica 3 - Stack MEAN: Sistema de Gestión de Empleados

Para las prácticas de JWT y despliegue separado AWS/Vercel, consulta
[el detalle de requisitos y configuración](deploy/PRACTICAS.md).

Implementación académica de un módulo CRUD de empleados utilizando **MongoDB, Express, Angular, Node.js y TypeScript**, desarrollada para la asignatura **Patrones de Diseño de APIs** de la Universidad Politécnica Salesiana.

**Autor:** Hugo Mauricio Saldarriaga Morales  
**Repositorio:** https://github.com/ImEcuadorian/empleados-mean

## Objetivo

Diseñar e implementar una arquitectura web desacoplada, robusta y escalable utilizando el Stack MEAN sobre TypeScript. La práctica parte de un CRUD tradicional y lo refactoriza aplicando separación de responsabilidades, validación perimetral, respuestas HTTP uniformes, programación reactiva e independencia entre componentes de presentación y lógica de aplicación.

## Retos implementados

### 1. Repository Pattern y desacoplamiento de persistencia

El controlador de Express ya no depende directamente de Mongoose. Se introdujo el contrato `IEmployeeRepository` y una implementación concreta `MongooseEmployeeRepository`.

```text
Controller
   |
   v
IEmployeeRepository
   |
   v
MongooseEmployeeRepository
   |
   v
MongoDB
```

Esto permite sustituir la tecnología de persistencia sin modificar el controlador.

### 2. Validación con Zod y Response Wrapper

Las entradas de la API se validan mediante esquemas declarativos de Zod antes de llegar al controlador. También se implementaron:

- DTOs para creación, actualización y parámetros de ruta.
- Middleware reutilizable de validación.
- `AppError` para errores controlados.
- Middleware global de errores.
- Respuestas HTTP uniformes mediante `ApiResponse<T>`.

Respuesta exitosa:

```json
{
  "success": true,
  "message": "Empleado creado correctamente",
  "data": {
    "id": "...",
    "nombre": "Ana Torres",
    "cargo": "Analista",
    "departamento": "Tecnología",
    "sueldo": 1200
  }
}
```

Respuesta de error:

```json
{
  "success": false,
  "message": "Datos de solicitud inválidos",
  "errors": {}
}
```

### 3. Estado reactivo e inmutabilidad en Angular

`EmpleadoService` centraliza el estado mediante un `BehaviorSubject` privado y expone `empleados$` como `Observable` de solo lectura.

Las mutaciones del estado generan nuevas referencias:

```ts
this.empleadosSubject.next([
  ...current,
  nuevoEmpleado
]);
```

La actualización usa `map()` y la eliminación usa `filter()`, evitando modificar directamente el arreglo existente.

### 4. Smart vs. Dumb Components

La interfaz se divide en componentes con responsabilidades claras:

- `EmpleadoComponent`: Smart Component / orquestador.
- `EmpleadoFormComponent`: componente presentacional que emite `@Output()`.
- `EmpleadoListComponent`: componente presentacional que recibe `@Input()` y emite `@Output()`.
- El Smart Component consume `empleados$` mediante `async pipe`.

```text
EmpleadoService
      |
      v
EmpleadoComponent (Smart)
    /                 \
   v                   v
EmpleadoForm        EmpleadoList
   (Dumb)              (Dumb)
```

## Tecnologías

| Capa | Tecnología |
| --- | --- |
| Backend | Node.js + Express 5 + TypeScript |
| Persistencia | MongoDB + Mongoose 9 |
| Validación | Zod 4 |
| Frontend | Angular 17 + TypeScript |
| Reactividad | RxJS 7 / BehaviorSubject |
| Desarrollo | Morgan, CORS, tsx |
| Control de versiones | Git + GitHub |

## Estructura del proyecto

```text
empleados-mean/
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── domain/
│       ├── dtos/
│       ├── errors/
│       ├── middlewares/
│       ├── models/
│       ├── repositories/
│       ├── routes/
│       ├── shared/
│       ├── app.ts
│       └── index.ts
└── frontend/
    └── src/app/
        ├── components/
        │   ├── empleado/
        │   ├── empleado-form/
        │   └── empleado-list/
        ├── models/
        └── services/
```

## API REST

Base URL:

```text
http://localhost:3000/api/v1
```

| Método | Endpoint | Descripción |
| --- | --- | --- |
| `GET` | `/empleados` | Consultar todos los empleados |
| `GET` | `/empleados/:id` | Consultar un empleado por ID |
| `POST` | `/empleados` | Registrar un empleado |
| `PUT` | `/empleados/:id` | Actualizar un empleado |
| `DELETE` | `/empleados/:id` | Eliminar un empleado |

Ejemplo de creación:

```json
{
  "nombre": "Ana Torres",
  "cargo": "Analista",
  "departamento": "Tecnología",
  "sueldo": 1200
}
```

## Requisitos

- Node.js LTS 20 o superior.
- npm.
- Angular CLI 16 o superior.
- MongoDB Server, MongoDB Atlas o MongoDB mediante Docker.

## Ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/ImEcuadorian/empleados-mean.git
cd empleados-mean
```

### 2. Iniciar MongoDB

Si se utiliza Docker:

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongo_data:/data/db \
  mongo:9.0.2
```

El backend utiliza la base:

```text
mongodb://127.0.0.1/usuarios_db
```

### 3. Ejecutar el backend

Primero configura la autenticación (desde `backend`):

```powershell
npm install
Copy-Item .env.example .env
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copia el secreto generado en `JWT_SECRET` dentro de `.env`. Configura también
`MONGO_URI` y `FRONTEND_ORIGIN` si cambias los valores locales. No subas `.env`
a GitHub. Si ya existe `.env`, conserva su contenido en lugar de sobrescribirlo.

Con MongoDB encendido, crea tu cuenta:

```powershell
npm run create-user
```

El comando solicita nombre, correo y una contraseña de al menos 12 caracteres
(máximo 72 bytes); oculta la entrada de contraseña y guarda únicamente su hash bcrypt.
No hay registro público: toda cuenta creada tiene acceso al CRUD completo.

```bash
cd backend
npm install
npm run dev
```

Servidor:

```text
http://localhost:3000
```

### 4. Ejecutar el frontend

En otra terminal:

```bash
cd frontend
npm install
npm start
```

Aplicación:

```text
http://localhost:4200
```

Abre `/login` e ingresa con la cuenta creada. El JWT dura 15 minutos y se guarda
en localStorage para esta práctica: al recargar se verifica con la API antes de
abrir la ruta protegida; cerrar sesión o expirar el token requiere otro login.
El botón de cerrar sesión borra el token y los empleados del estado de Angular.
Un token ya emitido puede seguir utilizándose fuera del navegador hasta vencer;
el cierre de sesión no implementa una lista de revocación. Eliminar el usuario
en MongoDB bloquea sus tokens en la siguiente petición.

El inicio y `/directorio` muestran la lista pública sin iniciar sesión. Desde
«Administrar empleados» se entra a `/empleados`, que exige autenticación. Allí
puedes crear, editar y eliminar. El lápiz de cada fila precarga el formulario;
«Guardar cambios» envía PUT y «Cancelar edición» descarta el borrador.
Los GET de empleados son públicos; POST, PUT y DELETE requieren JWT válido.

### Autenticación de la API

- `POST /api/v1/auth/login`: recibe `{ "email": "...", "password": "..." }`.
  Responde con `data.token`, `data.expiresIn` y `data.usuario`.
- `GET /api/v1/auth/me`: consulta los datos públicos del usuario autenticado.
- POST, PUT y DELETE de empleados requieren `Authorization: Bearer <token>`;
  las consultas GET son públicas.
- Se verifican firma HS256, emisor, audiencia, expiración y existencia del usuario.
- El login limita a 10 intentos fallidos por IP cada 15 minutos. El contador es
  local al proceso y se reinicia con el servidor.
- Las respuestas autenticadas no se almacenan en caché y el hash no se expone.

Para comprobar el código:

```powershell
cd backend
npm run typecheck
npm test -- --runInBand
cd ../frontend
npm run build
```

La compilación de producción usa `/api/v1` en el mismo origen. Para el despliegue
posterior habrá que configurar HTTPS y el proxy de Nginx hacia Node.js; si se
configura `trust proxy`, debe limitarse a los proxies de confianza para que el
límite de intentos use la IP correcta. Este cambio no realiza el despliegue.

## Flujo de una solicitud

```mermaid
flowchart LR
    A[Angular] --> B[Express Router]
    B --> C[Zod Validation]
    C --> D[EmpleadoController]
    D --> E[IEmployeeRepository]
    E --> F[MongooseEmployeeRepository]
    F --> G[(MongoDB)]
```


## Historial principal de refactorización

Los cambios de la práctica fueron organizados en commits independientes:

```text
43a14e4 refactor(backend): decouple employee persistence with repository pattern
1ae8968 feat(backend): add request validation and universal API responses
81a48da refactor(frontend): implement reactive employee state management
c951d7f refactor(frontend): split employee UI into smart and presentational components
```
## Código inicial

- Backend: https://github.com/pmpvhr/code.git
- Frontend: https://github.com/pmpvhr/maestria.git

## Licencia y uso

Proyecto desarrollado con fines académicos para la asignatura **Patrones de Diseño de APIs**.
