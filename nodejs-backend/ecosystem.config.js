const path = require('path');
const cwd = path.basename(path.resolve(process.cwd()));

module.exports = {
    apps: [
        {
            name: 'sunday2',
            script: 'src/',
            instance_var: 'INSTANCE_ID',
            appendEnvToName: true,
            // Standard Output (console.log) will go here
            //out_file: "D:/PM2_Logs/sunday2stg-out.log",
            // Error Output (console.error) will go here
            //error_file: "D:/PM2_Logs/sunday2-stg-error.log",
            // Optional: Add a date prefix to your logs
            //log_date_format: "YYYY-MM-DD HH:mm:ss Z",
            // How to run pm2
            //pm2 start ecosystem.config.js --env prd
            env_prd: {
                NODE_ENV: 'prd'
            },
            env_stg: {
                NODE_ENV: 'stg'
            },
            env_uat: {
                NODE_ENV: 'uat'
            },
            env_sit: {
                NODE_ENV: 'sit'
            }
        }
    ]
};
