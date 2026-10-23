# AWS EC2: Nginx + PM2 + GitHub Actions

La aplicación se publica en una instancia Ubuntu. Nginx sirve el resultado estático
de Angular y envía `/api/` al backend Node.js, que escucha solo en `127.0.0.1:3000`.
PM2 mantiene el proceso activo y systemd lo restaura tras reiniciar EC2.

## Despliegue continuo

Cada push a `main` ejecuta `.github/workflows/deploy.yml`:

1. Instala dependencias con `npm ci`, comprueba tipos y ejecuta las pruebas.
2. Compila backend y frontend. Empaqueta únicamente los archivos de ejecución.
3. Sube el artefacto a EC2 por SSH usando una llave exclusiva para despliegue.
4. Instala dependencias de producción, cambia el enlace `current` y reinicia PM2.
5. Comprueba `/api/v1/health`. Si falla, restaura la versión anterior cuando existe.

Los pull requests solo ejecutan las pruebas y compilación. Los despliegues también
pueden iniciarse manualmente desde Actions, seleccionando la rama `main`.

Configuración del repositorio en **Settings → Secrets and variables → Actions**:

| Tipo | Nombre | Contenido |
| --- | --- | --- |
| Variable | `EC2_HOST` | DNS público de la instancia |
| Secret | `EC2_DEPLOY_KEY` | Llave privada dedicada del usuario Linux `deploy` |
| Secret | `EC2_KNOWN_HOSTS` | Clave pública del host SSH verificada |

La llave de despliegue solo admite `deploy <SHA>` mediante `ssh-gateway.sh`,
sin terminal ni redirección de puertos. El usuario `deploy` no tiene sudo.
No se necesita una llave de AWS IAM para este mecanismo.

## Archivos de EC2

- `/srv/empleados/releases/`: versiones compiladas.
- `/srv/empleados/current`: enlace a la versión activa.
- `/srv/empleados/shared/backend.env`: configuración privada persistente (modo 600).
- `/srv/empleados/bin/deploy.sh`: activador de versiones, propiedad de root.
- `/usr/local/bin/empleados-deploy-gateway`: restricción de la llave de CI.
- `/etc/nginx/sites-available/empleados`: configuración web.

Los secretos de MongoDB y JWT permanecen en EC2 y no forman parte del artefacto
ni de Git. La cuenta de aplicación se guarda en Atlas con contraseña hasheada.
El archivo `deploy/nginx.conf` es la base HTTP; al habilitar TLS en EC2 se añade
el certificado y una redirección a HTTPS a la configuración instalada.

## Requisitos de red

- AWS: entrada TCP 80 y 443 para el sitio, y SSH 22 para administración y CI.
- Atlas: permitir la IPv4 pública de EC2 como una entrada `/32` en Network Access.
- No es necesario abrir el puerto 3000 hacia Internet.
- Conviene asociar una Elastic IP. Si cambia la IP de EC2, hay que actualizar
  `EC2_HOST`, la lista de Atlas, `FRONTEND_ORIGIN` y el certificado si cubre la IP.

## Operación

Entrando por SSH como `ubuntu`:

```bash
sudo -iu deploy pm2 status
sudo -iu deploy pm2 logs empleados-api --lines 30
sudo nginx -t
sudo systemctl status pm2-deploy nginx
curl --fail http://127.0.0.1:3000/api/v1/health
```

Las versiones antiguas se conservan para recuperación. Revisa periódicamente
el espacio de `/srv/empleados/releases/` y retira versiones que ya no necesites,
conservando la actual y al menos una anterior.

Para modificar las credenciales de Atlas edita el archivo privado en el servidor
y reinicia la aplicación con `sudo -iu deploy pm2 restart empleados-api`.
Mantén contraseñas fuertes antes de usar datos reales.
