# Backup service Dockerfile
FROM mongo:6.0

# Install cron and other utilities
RUN apt-get update && apt-get install -y \
    cron \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create backup directory
RUN mkdir -p /backups /app/scripts

# Copy backup scripts
COPY backup-script.sh /app/scripts/
RUN chmod +x /app/scripts/backup-script.sh

# Create crontab file
RUN echo "0 2 * * * /app/scripts/backup-script.sh >> /var/log/backup.log 2>&1" > /etc/cron.d/backup-cron
RUN chmod 0644 /etc/cron.d/backup-cron
RUN crontab /etc/cron.d/backup-cron

# Create log file
RUN touch /var/log/backup.log

WORKDIR /app

# Start cron daemon
CMD ["sh", "-c", "cron && tail -f /var/log/backup.log"]