module.exports = {
  apps: [
    {
      name: "alraay-backend",
      cwd: "./backend",
      script: "dist/main.js",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 4002
      }
    },
    {
      name: "alraay-frontend",
      cwd: "./front-end",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 4000",
      env: {
        NODE_ENV: "production",
        PORT: 4000
      }
    },
    {
      name: "alraay-admin",
      cwd: "./admin-dashboard",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 4001",
      env: {
        NODE_ENV: "production",
        PORT: 4001
      }
    }
  ]
};
