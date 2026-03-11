module.exports = {
  apps: [
    {
      name: 'zavlo-backend',
      script: 'dist/main.js',
      cwd: '/var/www/zavlo.ia/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/pm2/zavlo-backend-error.log',
      out_file: '/var/log/pm2/zavlo-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'zavlo-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/zavlo.ia/frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/pm2/zavlo-frontend-error.log',
      out_file: '/var/log/pm2/zavlo-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
