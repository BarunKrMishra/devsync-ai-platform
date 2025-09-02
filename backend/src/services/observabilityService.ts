import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { metrics, trace, context, SpanStatusCode, SpanKind } from '@opentelemetry/api';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { logger } from '../config/logger';

export interface MetricConfig {
  name: string;
  description: string;
  type: 'counter' | 'histogram' | 'gauge';
  labels?: string[];
}

export interface TraceConfig {
  name: string;
  attributes?: Record<string, string | number | boolean>;
  kind?: SpanKind;
}

export class ObservabilityService {
  private sdk: NodeSDK;
  private meter: any;
  private tracer: any;
  private metrics: Map<string, any> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeOpenTelemetry();
  }

  private initializeOpenTelemetry(): void {
    try {
      // Create Prometheus exporter
      const prometheusExporter = new PrometheusExporter({
        port: 9464,
        endpoint: '/metrics'
      });

      // Create Jaeger exporter
      const jaegerExporter = new JaegerExporter({
        endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces'
      });

      // Create resource
      const resource = new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'devsync-backend',
        [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development'
      });

      // Initialize SDK
      this.sdk = new NodeSDK({
        resource,
        traceExporter: jaegerExporter,
        metricReader: prometheusExporter,
        instrumentations: [
          getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-express': {
              enabled: true,
              requestHook: (span, info) => {
                span.setAttributes({
                  'http.request.body.size': info.request.body?.length || 0,
                  'user.id': info.request.headers['x-user-id'] || 'anonymous'
                });
              },
              responseHook: (span, info) => {
                span.setAttributes({
                  'http.response.body.size': info.response.body?.length || 0
                });
              }
            },
            '@opentelemetry/instrumentation-http': {
              enabled: true,
              requestHook: (span, request) => {
                span.setAttributes({
                  'http.request.method': request.method,
                  'http.request.url': request.url
                });
              }
            },
            '@opentelemetry/instrumentation-prisma': {
              enabled: true
            }
          })
        ]
      });

      // Start the SDK
      this.sdk.start();

      // Get meter and tracer
      this.meter = metrics.getMeter('devsync-backend');
      this.tracer = trace.getTracer('devsync-backend');

      // Initialize default metrics
      this.initializeDefaultMetrics();

      this.isInitialized = true;
      logger.info('OpenTelemetry initialized successfully');

    } catch (error) {
      logger.error('Failed to initialize OpenTelemetry', { error: error.message });
    }
  }

  private initializeDefaultMetrics(): void {
    // HTTP Request metrics
    this.createMetric({
      name: 'http_requests_total',
      description: 'Total number of HTTP requests',
      type: 'counter',
      labels: ['method', 'route', 'status_code']
    });

    this.createMetric({
      name: 'http_request_duration_seconds',
      description: 'HTTP request duration in seconds',
      type: 'histogram',
      labels: ['method', 'route', 'status_code']
    });

    // Database metrics
    this.createMetric({
      name: 'database_queries_total',
      description: 'Total number of database queries',
      type: 'counter',
      labels: ['operation', 'table', 'status']
    });

    this.createMetric({
      name: 'database_query_duration_seconds',
      description: 'Database query duration in seconds',
      type: 'histogram',
      labels: ['operation', 'table']
    });

    // AI Translation metrics
    this.createMetric({
      name: 'ai_translations_total',
      description: 'Total number of AI translations',
      type: 'counter',
      labels: ['status', 'type']
    });

    this.createMetric({
      name: 'ai_translation_duration_seconds',
      description: 'AI translation duration in seconds',
      type: 'histogram',
      labels: ['type']
    });

    // API Connector metrics
    this.createMetric({
      name: 'api_connector_requests_total',
      description: 'Total number of API connector requests',
      type: 'counter',
      labels: ['connector', 'status']
    });

    this.createMetric({
      name: 'api_connector_request_duration_seconds',
      description: 'API connector request duration in seconds',
      type: 'histogram',
      labels: ['connector']
    });

    // Error metrics
    this.createMetric({
      name: 'errors_total',
      description: 'Total number of errors',
      type: 'counter',
      labels: ['type', 'service', 'severity']
    });

    // Active users metric
    this.createMetric({
      name: 'active_users',
      description: 'Number of active users',
      type: 'gauge'
    });
  }

  createMetric(config: MetricConfig): void {
    if (!this.isInitialized) return;

    try {
      let metric;

      switch (config.type) {
        case 'counter':
          metric = this.meter.createCounter(config.name, {
            description: config.description
          });
          break;
        case 'histogram':
          metric = this.meter.createHistogram(config.name, {
            description: config.description
          });
          break;
        case 'gauge':
          metric = this.meter.createUpDownCounter(config.name, {
            description: config.description
          });
          break;
        default:
          throw new Error(`Unsupported metric type: ${config.type}`);
      }

      this.metrics.set(config.name, metric);
      logger.info('Metric created', { name: config.name, type: config.type });

    } catch (error) {
      logger.error('Failed to create metric', { error: error.message, config });
    }
  }

  recordMetric(name: string, value: number, labels?: Record<string, string>): void {
    if (!this.isInitialized) return;

    try {
      const metric = this.metrics.get(name);
      if (!metric) {
        logger.warn('Metric not found', { name });
        return;
      }

      metric.add(value, labels);
    } catch (error) {
      logger.error('Failed to record metric', { error: error.message, name, value, labels });
    }
  }

  createSpan(config: TraceConfig, fn: (span: any) => Promise<any>): Promise<any> {
    if (!this.isInitialized) {
      return fn(null);
    }

    return new Promise((resolve, reject) => {
      const span = this.tracer.startSpan(config.name, {
        kind: config.kind || SpanKind.INTERNAL,
        attributes: config.attributes
      });

      context.with(trace.setSpan(context.active(), span), async () => {
        try {
          const result = await fn(span);
          span.setStatus({ code: SpanStatusCode.OK });
          span.end();
          resolve(result);
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message
          });
          span.recordException(error);
          span.end();
          reject(error);
        }
      });
    });
  }

  addSpanEvent(span: any, name: string, attributes?: Record<string, any>): void {
    if (span) {
      span.addEvent(name, attributes);
    }
  }

  setSpanAttributes(span: any, attributes: Record<string, any>): void {
    if (span) {
      span.setAttributes(attributes);
    }
  }

  // Convenience methods for common metrics
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void {
    this.recordMetric('http_requests_total', 1, {
      method,
      route,
      status_code: statusCode.toString()
    });

    this.recordMetric('http_request_duration_seconds', duration, {
      method,
      route,
      status_code: statusCode.toString()
    });
  }

  recordDatabaseQuery(operation: string, table: string, duration: number, status: 'success' | 'error'): void {
    this.recordMetric('database_queries_total', 1, {
      operation,
      table,
      status
    });

    this.recordMetric('database_query_duration_seconds', duration, {
      operation,
      table
    });
  }

  recordAITranslation(type: string, duration: number, status: 'success' | 'error'): void {
    this.recordMetric('ai_translations_total', 1, {
      type,
      status
    });

    this.recordMetric('ai_translation_duration_seconds', duration, {
      type
    });
  }

  recordAPIConnectorRequest(connector: string, duration: number, status: 'success' | 'error'): void {
    this.recordMetric('api_connector_requests_total', 1, {
      connector,
      status
    });

    this.recordMetric('api_connector_request_duration_seconds', duration, {
      connector
    });
  }

  recordError(type: string, service: string, severity: 'low' | 'medium' | 'high' | 'critical'): void {
    this.recordMetric('errors_total', 1, {
      type,
      service,
      severity
    });
  }

  setActiveUsers(count: number): void {
    this.recordMetric('active_users', count);
  }

  // Health check endpoint data
  getHealthMetrics(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: {
      uptime: number;
      memoryUsage: NodeJS.MemoryUsage;
      cpuUsage: NodeJS.CpuUsage;
      activeConnections: number;
    };
  } {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Determine health status based on metrics
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (memoryUsage.heapUsed / memoryUsage.heapTotal > 0.9) {
      status = 'degraded';
    }
    
    if (uptime < 60) { // Less than 1 minute uptime
      status = 'unhealthy';
    }

    return {
      status,
      metrics: {
        uptime,
        memoryUsage,
        cpuUsage,
        activeConnections: 0 // TODO: Implement connection tracking
      }
    };
  }

  // Custom business metrics
  recordUserRegistration(userId: string, method: 'email' | 'oauth'): void {
    this.recordMetric('user_registrations_total', 1, {
      method
    });

    this.createSpan({
      name: 'user.registration',
      attributes: {
        'user.id': userId,
        'registration.method': method
      }
    }, async (span) => {
      this.addSpanEvent(span, 'user.registered', {
        'user.id': userId,
        'registration.method': method
      });
    });
  }

  recordProjectCreation(projectId: string, userId: string): void {
    this.recordMetric('projects_created_total', 1);

    this.createSpan({
      name: 'project.creation',
      attributes: {
        'project.id': projectId,
        'user.id': userId
      }
    }, async (span) => {
      this.addSpanEvent(span, 'project.created', {
        'project.id': projectId,
        'user.id': userId
      });
    });
  }

  recordCodeGeneration(projectId: string, framework: string, duration: number): void {
    this.recordMetric('code_generations_total', 1, {
      framework
    });

    this.recordMetric('code_generation_duration_seconds', duration, {
      framework
    });

    this.createSpan({
      name: 'code.generation',
      attributes: {
        'project.id': projectId,
        'framework': framework
      }
    }, async (span) => {
      this.addSpanEvent(span, 'code.generated', {
        'project.id': projectId,
        'framework': framework,
        'duration': duration
      });
    });
  }

  // Cleanup
  async shutdown(): Promise<void> {
    if (this.isInitialized && this.sdk) {
      await this.sdk.shutdown();
      this.isInitialized = false;
      logger.info('OpenTelemetry shutdown completed');
    }
  }
}

// Export singleton instance
export const observabilityService = new ObservabilityService();
