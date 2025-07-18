# Monitoring and Logging Setup Guide

This document provides instructions for setting up monitoring and logging for the Custom Candle E-commerce application.

## Overview

The monitoring and logging system consists of the following components:

1. **Application Logging**
   - Winston for structured logging
   - Daily rotating log files
   - Error notifications via email

2. **Metrics Collection**
   - Prometheus for metrics collection
   - Node.js metrics (memory, CPU, etc.)
   - Custom application metrics (HTTP requests, errors, etc.)

3. **Visualization**
   - Grafana for metrics visualization
   - Dashboards for key performance indicators

4. **Alerting**
   - Prometheus Alertmanager for alert management
   - Email notifications for critical issues

## Prerequisites

- Docker and Docker Compose
- Access to the server where the application is deployed
- SMTP server for email notifications

## Application Logging Setup

The application already includes Winston for logging. Logs are stored in the `logs` directory with daily rotation.

### Log Directory Structure

```
logs/
  ├── combined-YYYY-MM-DD.log    # All logs
  ├── error-YYYY-MM-DD.log       # Error logs only
  └── ...
```

### Log Levels

- **error**: Critical errors that require immediate attention
- **warn**: Warning conditions that should be reviewed
- **info**: Informational messages about normal operation
- **debug**: Detailed debugging information (development only)

### Environment Variables

Configure logging behavior with these environment variables:

```
LOG_LEVEL=info                   # Minimum log level to record
ADMIN_EMAIL=admin@example.com    # Email for error notifications
```

## Prometheus Setup

### 1. Create a Prometheus Configuration File

Create a file named `prometheus.yml` in your server's configuration directory:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - 'alert_rules.yml'

scrape_configs:
  - job_name: 'candle-ecommerce-api'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['api:4000']

  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

### 2. Create Alert Rules

Create a file named `alert_rules.yml`:

```yaml
groups:
  - name: candle-ecommerce
    rules:
      - alert: HighErrorRate
        expr: sum(rate(errors_total[5m])) / sum(rate(http_requests_total[5m])) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is above 10% for the last 5 minutes"

      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Slow response time detected"
          description: "95th percentile of response time is above 2 seconds for the last 5 minutes"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is above 90% for the last 5 minutes"
```

### 3. Set Up Alertmanager

Create a file named `alertmanager.yml`:

```yaml
global:
  resolve_timeout: 5m
  smtp_smarthost: 'smtp.example.com:587'
  smtp_from: 'alertmanager@example.com'
  smtp_auth_username: 'alertmanager'
  smtp_auth_password: 'password'

route:
  group_by: ['alertname']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'email-notifications'

receivers:
  - name: 'email-notifications'
    email_configs:
      - to: 'admin@example.com'
        send_resolved: true
```

### 4. Create Docker Compose File

Create a file named `monitoring-docker-compose.yml`:

```yaml
version: '3'

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - ./alert_rules.yml:/etc/prometheus/alert_rules.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
    ports:
      - '9090:9090'
    restart: always

  alertmanager:
    image: prom/alertmanager:latest
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    ports:
      - '9093:9093'
    restart: always

  node-exporter:
    image: prom/node-exporter:latest
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.ignored-mount-points=^/(sys|proc|dev|host|etc)($$|/)'
    ports:
      - '9100:9100'
    restart: always

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - '3000:3000'
    restart: always
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false

volumes:
  prometheus_data:
  alertmanager_data:
  grafana_data:
```

### 5. Start the Monitoring Stack

```bash
docker-compose -f monitoring-docker-compose.yml up -d
```

## Grafana Dashboard Setup

### 1. Access Grafana

Open your browser and navigate to `http://your-server-ip:3000`. Log in with:
- Username: admin
- Password: admin (change this after first login)

### 2. Add Prometheus Data Source

1. Go to Configuration > Data Sources
2. Click "Add data source"
3. Select "Prometheus"
4. Set URL to `http://prometheus:9090`
5. Click "Save & Test"

### 3. Import Dashboards

#### Node.js Application Dashboard

1. Go to Create > Import
2. Enter dashboard ID `11159` (Node.js Application Dashboard)
3. Select your Prometheus data source
4. Click "Import"

#### Node Exporter Dashboard

1. Go to Create > Import
2. Enter dashboard ID `1860` (Node Exporter Full)
3. Select your Prometheus data source
4. Click "Import"

### 4. Create Custom Dashboard

1. Go to Create > Dashboard
2. Add panels for:
   - Request Rate
   - Error Rate
   - Response Time
   - Memory Usage
   - CPU Usage

## Security Considerations

1. **Access Control**
   - Restrict access to Prometheus and Grafana
   - Use strong passwords
   - Consider setting up authentication proxy

2. **Network Security**
   - Use firewall rules to restrict access
   - Consider using a VPN for remote access

3. **Data Protection**
   - Regularly backup Prometheus and Grafana data
   - Encrypt sensitive data in configuration files

## Maintenance

### Log Rotation

Log files are automatically rotated daily and compressed after 14 days. Old logs are deleted after 14 days.

### Metrics Retention

Prometheus is configured to retain metrics for 15 days by default. Adjust the retention period in the Prometheus configuration if needed.

### Backup

Backup the following directories regularly:
- Application logs directory
- Prometheus data volume
- Grafana data volume

## Troubleshooting

### Common Issues

1. **Missing Metrics**
   - Check if the application is exposing metrics at `/metrics`
   - Verify Prometheus configuration
   - Check network connectivity between Prometheus and the application

2. **No Alerts**
   - Check Alertmanager configuration
   - Verify alert rules
   - Check email server configuration

3. **High Disk Usage**
   - Adjust log retention period
   - Adjust Prometheus retention period
   - Consider using external storage for logs and metrics