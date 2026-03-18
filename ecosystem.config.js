module.exports = {
  apps: [
    {
      name: "alatian-backend",
      cwd: "./backend",
      script: "dist/main.js",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3002
      }
    },
    {
      name: "alatian-frontend",
      cwd: "./front-end",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    },
    {
      name: "alatian-admin",
      cwd: "./admin-dashboard",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001",
      env: {
        NODE_ENV: "production",
        PORT: 3001
      }
    }
  ]
};
