const os = require("os");

module.exports = {
  apps: [
    {
      name: os.hostname(),
      script: process.env.PM2_SCRIPT, // "yarn run start:debug",
      autorestart: process.env.PM2_AUTORESTART,
      watch: process.env.PM2_WATCH,
      ignore_watch: process.env.PM2_IGNORE_WATCH
        ? JSON.parse(process.env.PM2_IGNORE_WATCH)
        : false,
      cwd: process.env.PM2_CWD || "/var/www/app",
      out_file: process.env.PM2_OUT_FILE || '',
      exec_mode: "fork_mode",
      instances: "1",
      node_args: "--inspect=0.0.0.0:9229", //53000
      time: false,
    },
  ],
};
