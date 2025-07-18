#!/bin/bash
# Automated backup script for Docker environment

set -e

# Configuration from environment variables
MONGODB_URI=${MONGODB_URI:-"mongodb://admin:adminpassword@mongodb:27017/candle-ecommerce?authSource=admin"}
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/mongodb_backup_$TIMESTAMP"
RETENTION_DAYS=${RETENTION_DAYS:-14}

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Log function
log() {
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] $1"
}

# Start backup process
log "Starting MongoDB backup"

# Execute mongodump
log "Creating database dump"
mongodump --uri="$MONGODB_URI" --out="$BACKUP_FILE"

# Compress backup
log "Compressing backup"
tar -czf "$BACKUP_FILE.tar.gz" -C "$BACKUP_DIR" "mongodb_backup_$TIMESTAMP"
rm -rf "$BACKUP_FILE"

# Calculate backup size
BACKUP_SIZE=$(du -h "$BACKUP_FILE.tar.gz" | cut -f1)
log "Backup completed successfully. Size: $BACKUP_SIZE"

# Delete old backups
log "Cleaning up old backups (older than $RETENTION_DAYS days)"
find "$BACKUP_DIR" -name "mongodb_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete

log "Backup process completed"