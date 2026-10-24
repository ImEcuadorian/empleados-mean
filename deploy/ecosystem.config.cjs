module.exports = {
  apps: [{
    name: 'empleados-api',
    script: '/srv/empleados/current/backend/dist/index.js',
    cwd: '/srv/empleados/current/backend',
    instances: 2,
    exec_mode: 'cluster',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '256M',
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 3000,
    env: { NODE_ENV: 'production', HOST: '127.0.0.1', PORT: 3000 }
  }]
};
