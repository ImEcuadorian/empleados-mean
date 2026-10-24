const { URL } = require('node:url');

async function notify(content) {
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) return false;
  const url = new URL(webhook);
  if (url.protocol !== 'https:' || !['discord.com', 'discordapp.com'].includes(url.hostname) ||
      !url.pathname.startsWith('/api/webhooks/')) throw new Error('Webhook de Discord inválido');
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.slice(0, 1900), allowed_mentions: { parse: [] } }),
        signal: AbortSignal.timeout(10000) });
      if (response.ok) return true;
      if (response.status !== 429 && response.status < 500) break;
    } catch { /* Retry without exposing webhook credentials in logs. */ }
    await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
  }
  throw new Error('No se pudo entregar la notificación a Discord');
}

module.exports = { notify };
if (require.main === module) {
  notify(process.argv[2] || 'Prueba de notificaciones de Empleados API')
    .then(sent => console.log(sent ? 'Notificación entregada' : 'Webhook no configurado'))
    .catch(() => { console.error('Fallo al notificar a Discord'); process.exitCode = 1; });
}
