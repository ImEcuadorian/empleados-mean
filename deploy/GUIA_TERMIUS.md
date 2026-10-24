# Usar Termius, probar Discord y consultar Nginx

El frontend está en https://empleados-mean.vercel.app. AWS ejecuta Nginx y el backend con PM2. MongoDB Atlas guarda los datos. Puedes cerrar Termius sin apagar el servidor: los servicios siguen ejecutándose.

## 1. Conectarte desde Termius

Crea un host con estos datos (los nombres de las opciones pueden variar según la versión):

| Campo         | Valor                   |
| ------------- | ----------------------- |
| Nombre        | Empleados AWS           |
| Dirección     | `34.236.215.254`        |
| Puerto        | `22`                    |
| Usuario       | `ubuntu`                |
| Autenticación | Clave SSH `Ups-api.pem` |

En Keychain → Keys importa la clave privada que ya está en `C:\Users\Usuario\.ssh\Ups-api.pem`. Asigna esa clave al host y abre la conexión. La contraseña del login de la web no es la autenticación SSH. La clave es privada: no la subas al repositorio ni la compartas.

Alternativa desde PowerShell:

```powershell
ssh -i "$env:USERPROFILE/.ssh/Ups-api.pem" ubuntu@34.236.215.254
```

Los siguientes comandos se ejecutan DENTRO de la terminal de Ubuntu que abre Termius.

## 2. Ver que todo está encendido

```bash
sudo -iu deploy pm2 status
sudo systemctl is-active nginx empleados-monitor
curl -fsS http://127.0.0.1:3000/api/v1/health
```

Debes ver dos procesos `empleados-api` en `online`, dos respuestas `active` y `{"success":true}`. Hay dos procesos porque PM2 está en modo clúster. Usa siempre `sudo -iu deploy` para manejar el PM2 de la aplicación.

## 3. Apagar solo el backend y recibir la alerta

Abre también el canal de Discord donde configuraste el webhook. Ejecuta:

```bash
sudo -iu deploy pm2 stop empleados-api
```

Esto detiene los dos procesos de la API. El monitor independiente sigue encendido: puede enviar un aviso por la parada de PM2 y detecta la falta de salud en su siguiente consulta, cada 30 segundos. Espera unos 40 segundos. Los avisos repetidos se agrupan para evitar spam.

Mientras esté detenido, la página de Vercel puede abrir, pero el login y las operaciones que necesitan la API fallarán. Si quieres demostrarlo, recarga el directorio para ver el mensaje de error.

Vuelve a encenderlo:

```bash
sudo -iu deploy pm2 start empleados-api
curl -fsS http://127.0.0.1:3000/api/v1/health
sudo -iu deploy pm2 status
```

Espera la siguiente comprobación del monitor para ver la recuperación en Discord y actualiza la web. Si acabas de iniciar el proceso, deja unos segundos antes del `curl`.

Esta prueba no requiere apagar la instancia EC2 ni Nginx. Si apagas toda la instancia, también apagas el monitor que vive en ella y no podrá enviar avisos; detectar ese caso necesitaría un monitor externo. Un despliegue nuevo desde GitHub volverá a iniciar la aplicación.

Si no llega el aviso:

```bash
sudo systemctl status empleados-monitor --no-pager
sudo journalctl -u empleados-monitor -n 30 --no-pager
```

## 4. Dónde está Nginx

Nginx ya funciona como servicio de Ubuntu. No tiene una ventana que necesites abrir. Recibe HTTPS y pasa las peticiones a Express en `127.0.0.1:3000`.

- Configuración de esta aplicación: `/etc/nginx/sites-available/empleados`.
- Enlace que activa esa configuración: `/etc/nginx/sites-enabled/empleados`.
- Configuración general: `/etc/nginx/nginx.conf`.
- Certificado público: `/etc/letsencrypt/live/empleados-ip/fullchain.pem`.

Para consultar el archivo sin editarlo:

```bash
sudo cat /etc/nginx/sites-available/empleados
```

Para abrirlo en el editor:

```bash
sudo nano /etc/nginx/sites-available/empleados
```

En nano: `Ctrl+X` sale; si hiciste cambios, `Ctrl+O`, Enter guarda. Solo si cambias la configuración, primero comprueba y después recarga:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Estado y últimos errores:

```bash
sudo systemctl status nginx --no-pager
sudo tail -n 30 /var/log/nginx/error.log
```

## 5. Ubicación del backend y logs

La versión activa está en `/srv/empleados/current/backend`, enlazada a un artefacto probado de GitHub Actions. Las variables privadas están en `/srv/empleados/shared/backend.env`; no las muestres en capturas. Haz cambios de código en tu equipo y súbelos a GitHub para conservar el despliegue automático.

```bash
sudo -iu deploy pm2 logs empleados-api --lines 30
```

`Ctrl+C` sale de la vista de logs, sin apagar el backend. `exit` cierra SSH, sin apagar los servicios.

## 6. Capturas para la práctica

Guarda capturas del login y directorio, de PM2 con los dos procesos online, de `sudo nginx -t` y del canal de Discord con caída y recuperación. Evita mostrar contraseñas, claves privadas, variables de entorno o la URL del webhook.

Referencias: [gestión de procesos PM2](https://doc.pm2.io/en/runtime/guide/process-management/), [guía Nginx](https://nginx.org/en/docs/beginners_guide.html), [comprobación de configuración Nginx](https://nginx.org/en/docs/switches.html).
