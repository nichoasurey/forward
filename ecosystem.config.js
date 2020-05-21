module.exports = {
  apps : [
    {
      name: "forward",
      script: "./app.js",
      watch: false,
      env: {
        "NODE_ENV": "default"
      },
      env_production: {
        "NODE_ENV": "production",
      }
    }
  ]
}