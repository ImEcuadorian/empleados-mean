// Independent systemd service: stays alive even when the API is stopped in PM2.
process.loadEnvFile('/srv/empleados/shared/monitor.env');
const pm2 = require('/usr/local/lib/node_modules/pm2');
const { notify } = require('./notify-discord.cjs');
const lastAlerts = new Map();
let previousHealth;

async function alert(key, message) {
  const now = Date.now();
  if (now - (lastAlerts.get(key) || 0) < 60000) return;
  lastAlerts.set(key, now);
  try { await notify(message); console.log('Alerta entregada:', key); }
  catch { console.error('No se pudo entregar alerta:', key); }
}

pm2.connect(error => {
  if (error) process.exit(1);
  pm2.launchBus((busError, bus) => {
    if (busError) process.exit(1);
    bus.on('process:event', event => {
      if (event.process?.name !== 'empleados-api' ||
          !['exit', 'stop', 'errored'].includes(event.event)) return;
      void alert(`pm2-${event.event}-${event.process.pm_id}`,
        `⚠️ AWS · empleados-api · evento ${event.event} · proceso ${event.process.pm_id}. Revisa PM2.`);
    });
    bus.on('error', () => process.exit(1));
  });
});

async function checkHealth() {
  let healthy = false;
  try {
    const response = await fetch('http://127.0.0.1:3000/api/v1/health',
      { signal: AbortSignal.timeout(5000) });
    healthy = response.ok && (await response.json()).success === true;
  } catch { /* Expected when the API is down. */ }
  if (!healthy && previousHealth !== false) await alert('health-down', '🔴 AWS · La API de empleados no responde o perdió conexión con MongoDB.');
  if (healthy && previousHealth === false) await alert('health-up', '🟢 AWS · La API de empleados volvió a estar disponible.');
  previousHealth = healthy;
}
void checkHealth();
setInterval(() => void checkHealth(), 30000);
