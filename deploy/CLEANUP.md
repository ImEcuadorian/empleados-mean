# Limpieza posterior a la entrega

El usuario pidió borrar todo lo perteneciente a esta práctica, incluido código
local y ZIP. La ejecución está pendiente hasta que confirme que ya guardó/entregó
el respaldo y que corresponde iniciar el borrado. Este archivo es un inventario,
no un script de eliminación.

## Recursos identificados

- AWS us-east-1: instancia `i-03002778b4ae29dfd`, sus volúmenes asociados y recursos
  exclusivos de esta instancia (verificar en la consola antes de eliminarlos).
- Elastic IP en Virginia: `34.236.215.254`. Desasociar y liberar después de terminar
  la instancia; verificar que ya no exista ningún vínculo necesario.
- Elastic IP sin uso en Ohio: `77.112.70.95` (asignación
  `eipalloc-028c761eb957a21e1`). Verificar que siga sin asociarse y liberarla.
- Vercel: proyecto `empleados-mean` del equipo
  `hugosmm2000-gmailcoms-projects`, despliegues y dominios de ese proyecto.
- GitHub: repositorio `ImEcuadorian/empleados-mean`, su deploy key
  `AWS EC2 read-only` y secrets `EC2_DEPLOY_KEY`, `EC2_KNOWN_HOSTS`,
  `DISCORD_WEBHOOK_URL`; variable `EC2_HOST` (desaparecen al eliminar el repo).
- Discord: webhook del canal utilizado para esta práctica. Eliminar ese webhook
  para revocar su URL. No borrar servidores/canales compartidos sin identificar
  previamente que sean exclusivos de la práctica.
- Atlas: base `usuarios_db` usada por la aplicación. El clúster `cluster0` y el
  usuario `hsaldarriaga` solo se eliminan si se confirma que son exclusivos de esta
  práctica; no borrar otras bases ni usuarios por compartir el mismo clúster.
- Llaves locales específicas: `~/.ssh/empleados-gh-actions` y su `.pub`.
  `~/.ssh/Ups-api.pem` es la llave de la instancia: comprobar antes de borrarla que
  no se utilice para otra instancia. No borrar la carpeta `.ssh` completa.
- Código local: `D:\Programación\patrones-api\empleados-mean` y su `.env` ignorado.
- ZIP: `C:\Users\Usuario\Downloads\PRACTICAS_7_8_Hugo_Saldarriaga.zip`.
- Evidencias generadas: `aws-login.png`, `vercel-aws-login.png` y las capturas
  adicionales de esta práctica en la carpeta de visualizaciones de esta conversación.
  No eliminar otras visualizaciones o archivos del usuario.

## Orden y comprobación

1. Confirmar que la entrega ya está hecha y que debe empezar la limpieza.
2. Desactivar despliegues automáticos, monitor y webhooks antes de apagar servicios.
3. Retirar los proyectos de Vercel y GitHub correspondientes.
4. Eliminar los datos de Atlas que sean exclusivos de esta práctica.
5. Terminar EC2 y comprobar volúmenes, snapshots, grupos de seguridad y llaves de
   EC2 específicos; no eliminar recursos compartidos ni la VPC por defecto.
6. Liberar ambas Elastic IP en sus regiones y revisar que no queden recursos
   facturables de esta práctica. La revisión de facturación no equivale a esperar
   que desaparezcan consumos históricos.
7. Borrar las llaves, evidencias, ZIP y directorio local identificados arriba,
   después de comprobar sus rutas absolutas. Conservar una lista de lo eliminado.

Eliminar el código y ZIP es irreversible sin otro respaldo; no iniciar este
inventario automáticamente al terminar un despliegue o una prueba.
