# Prácticas 7 y 8: requisitos y evidencias

## Seguridad

- JWT HS256 con secreto privado validado al iniciar, expiración, emisor y audiencia.
- Contraseñas con hash bcrypt; login validado con Zod y errores HTTP uniformes.
- Autenticación desacoplada con `IAuthRepository` y `MongooseAuthRepository`.
- Formulario de presentación `LoginFormComponent` y orquestador `LoginComponent`.
- Servicio reactivo, interceptor y guard. `/auth` y `/employees` son alias de las
  rutas españolas. El acceso directo a empleados exige una sesión válida.
- Sesión persistida en localStorage para esta práctica. Al recargar, el guard
  verifica el JWT con `/auth/me`; el contenido del almacenamiento no da permisos.
  localStorage puede ser leído por JavaScript: evita inyectar HTML no confiable.
- Se conservan tokens de 15 minutos y mensajes genéricos de credenciales en lugar
  de copiar el secreto fijo y los mensajes que revelan cuentas de los ejemplos.

## Infraestructura y despliegue

- Un repositorio con dos proyectos independientes: `backend/` y `frontend/`.
- AWS sirve únicamente Express por Nginx HTTPS, con Node en loopback:3000.
- Vercel sirve Angular y reenvía `/api/*` a AWS mediante `frontend/vercel.json`.
- Se requiere crear/importar el proyecto de Vercel con raíz `frontend`, conectar
  GitHub y confirmar su URL pública. Su integración Git despliega cada push.
- GitHub Actions prueba ambos proyectos y publica solo el backend en AWS.
- PM2 en clúster, dos procesos para dos vCPU, arranque con systemd y logrotate
  (10 MB por log, siete rotaciones comprimidas).
- El limitador de login de Express conserva contadores por proceso. En clúster
  no constituye una cuota global compartida; Redis sería necesario para esa cuota.
- Llave GitHub Actions → EC2 dedicada y restringida; otra llave EC2 → GitHub de
  solo lectura para clonar el repositorio. No se necesitan claves IAM de AWS.
- Certificado autofirmado de 365 días generado en las rutas de la guía como
  evidencia de OpenSSL; la configuración pública conserva el certificado confiable
  de Let's Encrypt para que Vercel y los navegadores validen HTTPS sin excepciones.
- La IP elástica y las reglas del grupo de seguridad deben verificarse en AWS.
  El grupo de seguridad no se puede auditar solamente desde una sesión SSH.

### PM2 Deploy como alternativa manual

El pipeline de producción usa artefactos probados y rollback. Para la demostración
manual de la guía se incluye `pm2-deploy.config.cjs`. Usa HTTPS para clonar el
repositorio público sin entregar otra llave privada al usuario `ubuntu`.
Este usuario necesita permisos sobre `/srv/empleados/pm2-source`.
Ejecutar desde la raíz, con PM2 instalado localmente:

```bash
pm2 deploy deploy/pm2-deploy.config.cjs production setup
pm2 deploy deploy/pm2-deploy.config.cjs production
```

No ejecutes ambas rutas de despliegue simultáneamente: las dos administran la misma
aplicación PM2. La alternativa manual queda preparada para la demostración;
no reemplaza el pipeline habitual ni se ha ejecutado como segundo despliegue.

## Discord

El usuario debe crear un webhook de su canal. No es necesario un bot ni un token
de Discord. La URL se guarda en `/srv/empleados/shared/monitor.env` (modo 600)
como `DISCORD_WEBHOOK_URL` y en un secreto de GitHub Actions del mismo nombre.

- `empleados-monitor.service` observa eventos de salida/parada/error de PM2 y
  consulta la salud de la API cada 30 segundos. Informa caídas y recuperaciones,
  con deduplicación durante un minuto y sin menciones a usuarios del canal.
- Un job de GitHub Actions informa el resultado de las pruebas y el despliegue.
- El monitor utiliza el bus oficial de PM2 y webhooks de Discord, como alternativa
  al módulo `pm2-notify` del ejemplo. Su ejecución es independiente del backend.
- Sin la URL privada del webhook no se puede activar ni verificar la entrega.

Para verificar alertas, con el monitor activo:

```bash
sudo -iu deploy pm2 stop empleados-api
# Confirmar alerta en Discord y volver a levantar inmediatamente:
sudo -iu deploy pm2 start empleados-api
sudo journalctl -u empleados-monitor -n 20 --no-pager
```

## Entrega

Guardar capturas de login, CRUD autenticado, pruebas sin token, PM2 en clúster,
redirección HTTPS, GitHub Actions y la alerta real en Discord. Entregar enlace
al repositorio público y ZIP del código sin `.env`, llaves ni node_modules.
No incluir contraseñas ni URLs de webhooks en las capturas.

Docker y OpenTelemetry figuran como recomendaciones en la guía de JWT; no son
pasos obligatorios del procedimiento de estas prácticas y no se incluyen aquí.
