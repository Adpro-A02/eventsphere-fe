import client from 'prom-client';

// Create a Registry to register the metrics
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({
  register,
  prefix: 'eventsphere_fe_',
});

// Custom metrics for your app
export const httpRequestDuration = new client.Histogram({
  name: 'eventsphere_fe_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

export const httpRequestTotal = new client.Counter({
  name: 'eventsphere_fe_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const activeUsers = new client.Gauge({
  name: 'eventsphere_fe_active_users',
  help: 'Number of currently active users',
});

export const eventActions = new client.Counter({
  name: 'eventsphere_fe_event_actions_total',
  help: 'Total number of event actions',
  labelNames: ['action_type', 'event_id'],
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeUsers);
register.registerMetric(eventActions);

export { register };