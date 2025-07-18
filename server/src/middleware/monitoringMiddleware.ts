/**
 * Monitoring Middleware
 * 
 * This middleware sets up Prometheus metrics collection for the application.
 */

import { Request, Response, NextFunction } from 'express';
import promClient from 'prom-client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Add default metrics (GC, memory usage, etc.)
promClient.collectDefaultMetrics({ register });

// HTTP request duration metric
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
});

// HTTP request counter
const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Error counter
const errorCounter = new promClient.Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'code'],
});

// Register the metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestCounter);
register.registerMetric(errorCounter);

// Middleware to collect metrics for each request
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip metrics collection for the metrics endpoint itself
  if (req.path === '/metrics') {
    return next();
  }
  
  // Start the timer
  const start = process.hrtime();
  
  // Record response metrics when the response is finished
  res.on('finish', () => {
    // Get route pattern
    const route = req.route ? req.route.path : req.path;
    
    // Calculate duration
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds + nanoseconds / 1e9;
    
    // Record metrics
    httpRequestDurationMicroseconds
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);
    
    httpRequestCounter
      .labels(req.method, route, res.statusCode.toString())
      .inc();
    
    // Record error metrics for status codes >= 400
    if (res.statusCode >= 400) {
      const errorType = res.statusCode >= 500 ? 'server_error' : 'client_error';
      errorCounter.labels(errorType, res.statusCode.toString()).inc();
    }
  });
  
  next();
};

// Endpoint to expose metrics
export const metricsEndpoint = (_req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  register.metrics().then(metrics => {
    res.end(metrics);
  });
};

// Function to increment error counter from other parts of the application
export const incrementErrorCounter = (type: string, code: string | number) => {
  errorCounter.labels(type, code.toString()).inc();
};

export default {
  metricsMiddleware,
  metricsEndpoint,
  incrementErrorCounter,
};