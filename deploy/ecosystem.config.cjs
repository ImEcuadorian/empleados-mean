module.exports = {
  apps: [{
    name: 'empleados-api',
    script: '/srv/empleados/current/backend/dist/index.js',
    cwd: '/srv/empleados/current/backend',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '256M',
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 3000,
    env: { NODE_ENV: 'production', HOST: '127.0.0.1', PORT: 3000 }
  }]
};
