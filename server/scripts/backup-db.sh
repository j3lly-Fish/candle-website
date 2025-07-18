#!/bin/bash
# MongoDB Backup Script for Candle E-commerce Application

# Exit on error
set -e

# Load environment variables from .env file
if [ -f ../.env ]; then
  export $(grep -v '^#' ../.env | xargs)
fi

# Configuration
BACKUP_DIR="/var/backups/candle-ecommerce/mongodb"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/mongodb_backup_$TIMESTAMP"
LOG_FILE="$BACKUP_DIR/backup_log_$TIMESTAMP.log"
RETENTION_DAYS=14

# MongoDB connection parameters
MONGODB_HOST=${MONGODB_HOST:-"localhost"}
MONGODB_PORT=${MONGODB_PORT:-"27017"}
MONGODB_USER=${MONGODB_USER:-""}
MONGODB_PASSWORD=${MONGODB_PASSWORD:-""}
MONGODB_AUTH_DB=${MONGODB_AUTH_DB:-"admin"}
MONGODB_DB=${MONGODB_DB:-"candle-ecommerce"}

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Log function
log() {
  echo "[$(date +"%Y-%m-%d %H:%M:%S")] $1" | tee -a $LOG_FILE
}

# Start backup process
log "Starting MongoDB backup"

# Build mongodump command
MONGODUMP_CMD="mongodump --host $MONGODB_HOST --port $MONGODB_PORT --db $MONGODB_DB --out $BACKUP_FILE"

# Add authentication if credentials are provided
if [ -n "$MONGODB_USER" ] && [ -n "$MONGODB_PASSWORD" ]; then
  MONGODUMP_CMD="$MONGODUMP_CMD --username $MONGODB_USER --password $MONGODB_PASSWORD --authenticationDatabase $MONGODB_AUTH_DB"
fi

# Execute mongodump
log "Executing: $MONGODUMP_CMD"
eval $MONGODUMP_CMD >> $LOG_FILE 2>&1

# Compress backup
log "Compressing backup"
tar -czf "$BACKUP_FILE.tar.gz" -C $BACKUP_DIR "mongodb_backup_$TIMESTAMP"
rm -rf $BACKUP_FILE

# Calculate backup size
BACKUP_SIZE=$(du -h "$BACKUP_FILE.tar.gz" | cut -f1)
log "Backup completed successfully. Size: $BACKUP_SIZE"

# Delete old backups
log "Cleaning up old backups (older than $RETENTION_DAYS days)"
find $BACKUP_DIR -name "mongodb_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "backup_log_*.log" -type f -mtime +$RETENTION_DAYS -delete

# Copy to remote location if configured
if [ -n "$REMOTE_BACKUP_HOST" ] && [ -n "$REMOTE_BACKUP_USER" ] && [ -n "$REMOTE_BACKUP_PATH" ]; then
  log "Copying backup to remote location: $REMOTE_BACKUP_USER@$REMOTE_BACKUP_HOST:$REMOTE_BACKUP_PATH"
  scp "$BACKUP_FILE.tar.gz" $REMOTE_BACKUP_USER@$REMOTE_BACKUP_HOST:$REMOTE_BACKUP_PATH
  log "Remote backup completed"
fi

log "Backup process completed"

# Send notification if configured
if [ -n "$NOTIFICATION_EMAIL" ]; then
  log "Sending notification email to $NOTIFICATION_EMAIL"
  echo "MongoDB backup completed successfully on $(date). Backup size: $BACKUP_SIZE" | mail -s "MongoDB Backup Completed" $NOTIFICATION_EMAIL
fi

exit 0