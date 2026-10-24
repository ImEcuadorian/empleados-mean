// Optional manual lab workflow. The normal production path is GitHub Actions.
module.exports = {
  apps: [{
    name: 'empleados-api',
    cwd: '/srv/empleados/pm2-source/current/backend',
    script: 'dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    max_memory_restart: '256M',
    merge_logs: true,
    env: { NODE_ENV: 'production', HOST: '127.0.0.1', PORT: 3000 }
  }],
  deploy: {
    production: {
      user: 'ubuntu',
      host: process.env.EC2_HOST || 'ec2-54-237-180-230.compute-1.amazonaws.com',
      ref: 'origin/main',
      repo: 'git@github.com:ImEcuadorian/empleados-mean.git',
      path: '/srv/empleados/pm2-source',
      key: process.env.EC2_SSH_KEY || `${require('node:os').homedir()}/.ssh/Ups-api.pem`,
      'post-deploy': 'cd backend && npm ci && npm run build && ln -sfn /srv/empleados/shared/backend.env .env && sudo -u deploy pm2 startOrReload ../deploy/pm2-deploy.config.cjs --env production && sudo -u deploy pm2 save'
    }
  }
};
