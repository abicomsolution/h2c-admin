module.exports = {
  apps : [{
    name   : "H2C-Admin",
    exec_mode: 'cluster',
      instances: 1,
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      env_local: {
        APP_ENV: 'local', // APP_ENV=local
        PORT: 3005 // Set your desired port for local
      },
      env_dev: {
        APP_ENV: 'dev', // APP_ENV=dev
        PORT: 4005 // Set your desired port for dev
      },
      env_prod: {
        APP_ENV: 'prod', // APP_ENV=prod
        PORT: 3002 // Set your desired port for prod
      }
  }]
}
