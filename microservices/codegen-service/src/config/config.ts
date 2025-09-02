import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3004', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Code generation specific config
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  maxFilesPerRequest: parseInt(process.env.MAX_FILES_PER_REQUEST || '100', 10),
  templateCacheSize: parseInt(process.env.TEMPLATE_CACHE_SIZE || '1000', 10),
  
  // Supported frameworks
  supportedFrameworks: {
    react: {
      name: 'React',
      version: '18.2.0',
      templates: ['component', 'hook', 'context', 'page']
    },
    vue: {
      name: 'Vue.js',
      version: '3.3.0',
      templates: ['component', 'composable', 'store', 'page']
    },
    angular: {
      name: 'Angular',
      version: '17.0.0',
      templates: ['component', 'service', 'guard', 'module']
    },
    nodejs: {
      name: 'Node.js',
      version: '20.0.0',
      templates: ['controller', 'service', 'middleware', 'route']
    },
    express: {
      name: 'Express.js',
      version: '4.18.0',
      templates: ['route', 'middleware', 'controller', 'model']
    },
    nestjs: {
      name: 'NestJS',
      version: '10.0.0',
      templates: ['controller', 'service', 'module', 'guard']
    },
    python: {
      name: 'Python',
      version: '3.11.0',
      templates: ['class', 'function', 'module', 'test']
    },
    django: {
      name: 'Django',
      version: '4.2.0',
      templates: ['view', 'model', 'serializer', 'url']
    },
    flask: {
      name: 'Flask',
      version: '2.3.0',
      templates: ['route', 'model', 'form', 'template']
    }
  },
  
  // Output formats
  outputFormats: ['zip', 'tar', 'files'],
  
  // Telemetry
  telemetryEnabled: process.env.TELEMETRY_ENABLED === 'true',
  jaegerAgentHost: process.env.JAEGER_AGENT_HOST || 'localhost',
  jaegerAgentPort: parseInt(process.env.JAEGER_AGENT_PORT || '6832', 10),
  prometheusPort: parseInt(process.env.PROMETHEUS_PORT || '9468', 10)
};
