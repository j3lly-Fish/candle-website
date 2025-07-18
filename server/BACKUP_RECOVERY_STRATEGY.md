# Backup and Recovery Strategy

This document outlines the backup and recovery strategy for the Custom Candle E-commerce application.

## Overview

The backup and recovery strategy ensures data integrity and business continuity in case of system failures, data corruption, or disasters. The strategy covers:

1. **Database Backups**
   - Regular automated backups of MongoDB data
   - Secure storage of backup files
   - Retention policies

2. **Application Backups**
   - Code repository backups
   - Configuration files backups
   - Media files backups

3. **Recovery Procedures**
   - Database restoration
   - Application restoration
   - Disaster recovery

## Backup Schedule

| Data Type | Backup Frequency | Retention Period | Storage Location |
|-----------|------------------|------------------|------------------|
| MongoDB Database | Daily | 14 days | Local + Remote |
| MongoDB Database | Weekly | 3 months | Local + Remote |
| MongoDB Database | Monthly | 1 year | Local + Remote + Cold Storage |
| Application Code | On every commit | Indefinite | Git Repository |
| Configuration Files | Weekly | 6 months | Local + Remote |
| Media Files | Daily | 30 days | Local + Remote |
| Log Files | No backup (rotated) | 14 days | Local |

## Backup Implementation

### Database Backups

#### Daily Automated Backups

The system uses the `backup-db.sh` script to create daily backups of the MongoDB database. This script:

1. Creates a full dump of the MongoDB database using `mongodump`
2. Compresses the backup into a tarball
3. Stores the backup in the local backup directory
4. Copies the backup to a remote storage location
5. Removes backups older than the retention period
6. Sends a notification email upon completion

To set up automated daily backups, add the following to your crontab:

```bash
# Run database backup every day at 2:00 AM
0 2 * * * /var/www/candle-ecommerce/server/scripts/backup-db.sh
```

#### Manual Backups

Before major system changes or updates, perform a manual backup:

```bash
cd /var/www/candle-ecommerce/server
./scripts/backup-db.sh
```

### Application Code Backups

The application code is version-controlled using Git. Ensure that:

1. All code changes are committed to the repository
2. The repository is pushed to a remote location (GitHub, GitLab, etc.)
3. Consider setting up a mirror repository for additional redundancy

### Configuration Files Backups

Configuration files contain sensitive information and are not stored in the Git repository. Back up these files separately:

1. Create a script to collect and encrypt configuration files
2. Store encrypted backups in a secure location
3. Regularly test the restoration process

Example backup script for configuration files:

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/candle-ecommerce/config"
mkdir -p $BACKUP_DIR

# Collect configuration files
tar -czf $BACKUP_DIR/config_backup_$TIMESTAMP.tar.gz \
    /var/www/candle-ecommerce/.env.local \
    /var/www/candle-ecommerce/server/.env \
    /etc/nginx/sites-available/candle-ecommerce

# Encrypt the backup
gpg --encrypt --recipient admin@example.com $BACKUP_DIR/config_backup_$TIMESTAMP.tar.gz
rm $BACKUP_DIR/config_backup_$TIMESTAMP.tar.gz

# Clean up old backups
find $BACKUP_DIR -name "config_backup_*.tar.gz.gpg" -type f -mtime +180 -delete
```

### Media Files Backups

Media files (product images, etc.) are stored in the file system and should be backed up separately:

1. Use `rsync` to create incremental backups
2. Store backups in a separate location
3. Consider using object storage (S3, etc.) for both primary storage and backups

Example backup script for media files:

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/candle-ecommerce/media"
mkdir -p $BACKUP_DIR

# Create incremental backup of media files
rsync -a --delete --link-dest=$BACKUP_DIR/latest \
    /var/www/candle-ecommerce/public/media/ \
    $BACKUP_DIR/$TIMESTAMP/

# Update the 'latest' symlink
rm -f $BACKUP_DIR/latest
ln -s $BACKUP_DIR/$TIMESTAMP $BACKUP_DIR/latest

# Clean up old backups
find $BACKUP_DIR -maxdepth 1 -type d -mtime +30 -not -path "$BACKUP_DIR" -not -path "$BACKUP_DIR/latest" -exec rm -rf {} \;
```

## Remote Storage

Store backups in multiple locations to protect against local disasters:

1. **Primary Remote Storage**: Secure FTP server or cloud storage (AWS S3, Google Cloud Storage, etc.)
2. **Secondary Remote Storage**: Different geographic location or cloud provider
3. **Cold Storage**: For long-term archival (monthly backups)

Configure remote storage credentials in the environment variables:

```
REMOTE_BACKUP_HOST=backup-server.example.com
REMOTE_BACKUP_USER=backup-user
REMOTE_BACKUP_PATH=/backups/candle-ecommerce
```

## Encryption

Encrypt all backups that contain sensitive information:

1. Use GPG for encryption
2. Store encryption keys securely
3. Ensure multiple team members have access to decryption keys
4. Regularly rotate encryption keys

## Backup Verification

Regularly verify that backups are valid and can be restored:

1. Perform monthly test restorations
2. Document the verification process
3. Address any issues immediately

## Recovery Procedures

### Database Recovery

To restore the MongoDB database from a backup:

1. Stop the application services:
   ```bash
   pm2 stop candle-backend
   ```

2. Extract the backup:
   ```bash
   tar -xzf /var/backups/candle-ecommerce/mongodb/mongodb_backup_YYYYMMDD_HHMMSS.tar.gz -C /tmp/
   ```

3. Restore the database:
   ```bash
   mongorestore --host localhost --port 27017 --db candle-ecommerce --drop /tmp/mongodb_backup_YYYYMMDD_HHMMSS/candle-ecommerce
   ```

4. Restart the application services:
   ```bash
   pm2 start candle-backend
   ```

### Application Recovery

To restore the application code:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/candle-ecommerce.git /var/www/candle-ecommerce
   ```

2. Check out the desired version:
   ```bash
   cd /var/www/candle-ecommerce
   git checkout v1.0.0  # or specific commit hash
   ```

3. Restore configuration files:
   ```bash
   # Decrypt the backup
   gpg --decrypt /var/backups/candle-ecommerce/config/config_backup_YYYYMMDD_HHMMSS.tar.gz.gpg > /tmp/config_backup.tar.gz
   
   # Extract configuration files
   tar -xzf /tmp/config_backup.tar.gz -C /tmp/
   
   # Copy files to their locations
   cp /tmp/var/www/candle-ecommerce/.env.local /var/www/candle-ecommerce/
   cp /tmp/var/www/candle-ecommerce/server/.env /var/www/candle-ecommerce/server/
   cp /tmp/etc/nginx/sites-available/candle-ecommerce /etc/nginx/sites-available/
   ```

4. Restore media files:
   ```bash
   rsync -a /var/backups/candle-ecommerce/media/latest/ /var/www/candle-ecommerce/public/media/
   ```

5. Install dependencies and build the application:
   ```bash
   cd /var/www/candle-ecommerce
   npm ci
   npm run build
   
   cd /var/www/candle-ecommerce/server
   npm ci
   npm run build
   ```

6. Restart services:
   ```bash
   pm2 restart all
   sudo systemctl restart nginx
   ```

### Disaster Recovery

In case of complete server failure:

1. Provision a new server with the same specifications
2. Install required software (Node.js, MongoDB, Nginx, etc.)
3. Follow the application recovery procedure
4. Follow the database recovery procedure
5. Update DNS records if the server IP has changed

## Recovery Time Objectives (RTO)

| Scenario | RTO |
|----------|-----|
| Database corruption | 1 hour |
| Application code issues | 30 minutes |
| Configuration issues | 15 minutes |
| Complete server failure | 4 hours |
| Disaster recovery | 8 hours |

## Recovery Point Objectives (RPO)

| Data Type | RPO |
|-----------|-----|
| Database | 24 hours (max data loss from last backup) |
| Application code | 0 (version controlled) |
| Configuration files | 7 days |
| Media files | 24 hours |

## Monitoring and Alerting

Monitor the backup process and set up alerts for failures:

1. Check backup completion status
2. Verify backup file sizes
3. Monitor available storage space
4. Send alerts for backup failures

## Roles and Responsibilities

| Role | Responsibilities |
|------|------------------|
| System Administrator | Configure and maintain backup systems |
| Database Administrator | Verify database backups and perform restorations |
| DevOps Engineer | Automate backup and recovery processes |
| Security Officer | Ensure backup security and encryption |
| All Team Members | Be familiar with basic recovery procedures |

## Documentation

Maintain detailed documentation for all backup and recovery procedures:

1. Update this document when procedures change
2. Document all backup and recovery activities
3. Keep a log of all restorations and issues encountered

## Testing Schedule

| Test Type | Frequency | Responsible |
|-----------|-----------|-------------|
| Database restoration | Monthly | Database Administrator |
| Application restoration | Quarterly | DevOps Engineer |
| Full disaster recovery | Bi-annually | System Administrator |
| Backup verification | Weekly | Automated + System Administrator |

## Continuous Improvement

Regularly review and improve the backup and recovery strategy:

1. Analyze any failures or issues
2. Update procedures based on lessons learned
3. Incorporate new technologies and best practices
4. Adjust retention periods and schedules as needed