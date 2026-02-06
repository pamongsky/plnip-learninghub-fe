// PM2 Ecosystem Configuration for Production Deployment
// https://pm2.keymetrics.io/docs/usage/application-declaration/

module.exports = {
  apps: [
    {
      name: "plnip-portal-frontend",
      script: "npm",
      args: "start",
      cwd: "/var/www/plnip-portal-frontend", // Update with actual path
      instances: 2, // Run 2 instances for load balancing
      exec_mode: "cluster",

      // Environment
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },

      // Logging
      error_file: "/var/log/pm2/plnip-frontend-error.log",
      out_file: "/var/log/pm2/plnip-frontend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      // Auto-restart configuration
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 4000,

      // Memory management
      max_memory_restart: "500M",

      // Process management
      kill_timeout: 5000,
      listen_timeout: 3000,

      // Health check
      wait_ready: true,

      // Watch mode (disable in production)
      watch: false,

      // Additional PM2 Plus features
      instance_var: "INSTANCE_ID",

      // Post-deployment commands
      post_update: ["npm install", "npm run build"],
    },
  ],

  // Deployment configuration
  deploy: {
    production: {
      user: "deploy",
      host: "portal.plnip.ac.id",
      ref: "origin/main",
      repo: "git@github.com:organization/plnip-portal-frontend.git", // Update with actual repo
      path: "/var/www/plnip-portal-frontend",

      // Pre-setup commands
      "pre-setup": "apt-get install git -y",

      // Post-setup commands (run once after first clone)
      "post-setup": [
        "npm install",
        "cp .env.production.example .env.production",
        'echo "Please configure .env.production file"',
      ].join(" && "),

      // Pre-deploy commands (run before deployment)
      "pre-deploy": "git fetch --all",

      // Post-deploy commands (run after code update)
      "post-deploy": [
        "npm install",
        "npm run build",
        "pm2 reload ecosystem.config.js --env production",
        "pm2 save",
      ].join(" && "),

      // Environment
      env: {
        NODE_ENV: "production",
      },
    },

    staging: {
      user: "deploy",
      host: "staging.portal.plnip.ac.id",
      ref: "origin/develop",
      repo: "git@github.com:organization/plnip-portal-frontend.git",
      path: "/var/www/staging-plnip-portal-frontend",

      "post-deploy": [
        "npm install",
        "npm run build",
        "pm2 reload ecosystem.config.js --env staging",
      ].join(" && "),

      env: {
        NODE_ENV: "staging",
      },
    },
  },
};

/*
 * USAGE INSTRUCTIONS
 * ==================
 *
 * 1. Install PM2 globally:
 *    npm install -g pm2
 *
 * 2. Setup deployment (first time only):
 *    pm2 deploy production setup
 *
 * 3. Deploy to production:
 *    pm2 deploy production
 *
 * 4. Start application manually:
 *    pm2 start ecosystem.config.js --env production
 *
 * 5. Manage application:
 *    pm2 list                    # List all processes
 *    pm2 logs plnip-portal-frontend  # View logs
 *    pm2 monit                   # Monitor resources
 *    pm2 restart plnip-portal-frontend  # Restart app
 *    pm2 stop plnip-portal-frontend     # Stop app
 *    pm2 delete plnip-portal-frontend   # Delete app
 *
 * 6. Save PM2 configuration (auto-restart on reboot):
 *    pm2 save
 *    pm2 startup systemd         # Generate startup script
 *
 * 7. Update deployment:
 *    pm2 deploy production update
 *
 * 8. Rollback deployment:
 *    pm2 deploy production revert 1
 *
 * 9. View deployment status:
 *    pm2 deploy production status
 *
 * MONITORING
 * ==========
 *
 * Enable PM2 Plus for advanced monitoring:
 * pm2 link <secret> <public> <machine-name>
 *
 * Or use built-in monitoring:
 * pm2 monit
 * pm2 list
 * pm2 show plnip-portal-frontend
 *
 * LOGS
 * ====
 *
 * View logs:
 * pm2 logs plnip-portal-frontend
 * pm2 logs plnip-portal-frontend --lines 100
 * pm2 logs plnip-portal-frontend --err
 *
 * Clear logs:
 * pm2 flush
 *
 * PRODUCTION BEST PRACTICES
 * =========================
 *
 * 1. Use cluster mode with multiple instances
 * 2. Set max_memory_restart to prevent memory leaks
 * 3. Configure proper logging paths
 * 4. Use PM2 with systemd for auto-restart on reboot
 * 5. Set up log rotation (logrotate)
 * 6. Monitor with PM2 Plus or external monitoring
 * 7. Use deployment commands for zero-downtime deploys
 * 8. Configure firewall to allow necessary ports
 * 9. Use HTTPS with proper SSL certificates
 * 10. Set up automated backups
 */
