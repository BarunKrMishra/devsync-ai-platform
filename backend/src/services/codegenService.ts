import { Entity, OpenAPISpec } from './aiTranslatorService';
import { logger } from '../config/logger';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface CodeGenOptions {
  framework: 'node' | 'laravel' | 'java' | 'python' | 'react' | 'vue' | 'angular';
  database: 'postgresql' | 'mysql' | 'mongodb';
  includeAuth: boolean;
  includeTests: boolean;
  includeDocs: boolean;
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'composer' | 'maven' | 'gradle' | 'pip';
}

export interface GeneratedCode {
  files: {
    path: string;
    content: string;
    type: 'backend' | 'frontend' | 'database' | 'config' | 'test' | 'docs';
  }[];
  dependencies: string[];
  scripts: Record<string, string>;
  instructions: string[];
}

export class CodeGenService {
  private templates: Map<string, string> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Node.js/Express templates
    this.templates.set('node-server', this.getNodeServerTemplate());
    this.templates.set('node-controller', this.getNodeControllerTemplate());
    this.templates.set('node-model', this.getNodeModelTemplate());
    this.templates.set('node-route', this.getNodeRouteTemplate());
    this.templates.set('node-middleware', this.getNodeMiddlewareTemplate());
    
    // Laravel templates
    this.templates.set('laravel-controller', this.getLaravelControllerTemplate());
    this.templates.set('laravel-model', this.getLaravelModelTemplate());
    this.templates.set('laravel-migration', this.getLaravelMigrationTemplate());
    this.templates.set('laravel-route', this.getLaravelRouteTemplate());
    
    // Java Spring Boot templates
    this.templates.set('java-controller', this.getJavaControllerTemplate());
    this.templates.set('java-entity', this.getJavaEntityTemplate());
    this.templates.set('java-repository', this.getJavaRepositoryTemplate());
    this.templates.set('java-service', this.getJavaServiceTemplate());
    
    // React templates
    this.templates.set('react-component', this.getReactComponentTemplate());
    this.templates.set('react-hook', this.getReactHookTemplate());
    this.templates.set('react-service', this.getReactServiceTemplate());
    
    // Database templates
    this.templates.set('prisma-schema', this.getPrismaSchemaTemplate());
    this.templates.set('sql-migration', this.getSqlMigrationTemplate());
  }

  async generateCode(
    entities: Entity[],
    openApiSpec: OpenAPISpec,
    options: CodeGenOptions
  ): Promise<GeneratedCode> {
    try {
      logger.info('Starting code generation', { 
        framework: options.framework, 
        database: options.database,
        entityCount: entities.length 
      });

      const generatedCode: GeneratedCode = {
        files: [],
        dependencies: [],
        scripts: {},
        instructions: []
      };

      // Generate backend code
      if (['node', 'laravel', 'java', 'python'].includes(options.framework)) {
        await this.generateBackendCode(entities, openApiSpec, options, generatedCode);
      }

      // Generate frontend code
      if (['react', 'vue', 'angular'].includes(options.framework)) {
        await this.generateFrontendCode(entities, openApiSpec, options, generatedCode);
      }

      // Generate database code
      await this.generateDatabaseCode(entities, options, generatedCode);

      // Generate configuration files
      await this.generateConfigFiles(options, generatedCode);

      // Generate tests
      if (options.includeTests) {
        await this.generateTestFiles(entities, openApiSpec, options, generatedCode);
      }

      // Generate documentation
      if (options.includeDocs) {
        await this.generateDocumentation(entities, openApiSpec, options, generatedCode);
      }

      // Add setup instructions
      this.addSetupInstructions(options, generatedCode);

      logger.info('Code generation completed', { 
        fileCount: generatedCode.files.length,
        dependencyCount: generatedCode.dependencies.length 
      });

      return generatedCode;

    } catch (error) {
      logger.error('Code generation failed', { error: error.message });
      throw error;
    }
  }

  private async generateBackendCode(
    entities: Entity[],
    openApiSpec: OpenAPISpec,
    options: CodeGenOptions,
    generatedCode: GeneratedCode
  ): Promise<void> {
    switch (options.framework) {
      case 'node':
        await this.generateNodeCode(entities, openApiSpec, options, generatedCode);
        break;
      case 'laravel':
        await this.generateLaravelCode(entities, openApiSpec, options, generatedCode);
        break;
      case 'java':
        await this.generateJavaCode(entities, openApiSpec, options, generatedCode);
        break;
      case 'python':
        await this.generatePythonCode(entities, openApiSpec, options, generatedCode);
        break;
    }
  }

  private async generateNodeCode(
    entities: Entity[],
    openApiSpec: OpenAPISpec,
    options: CodeGenOptions,
    generatedCode: GeneratedCode
  ): Promise<void> {
    // Add dependencies
    generatedCode.dependencies.push(
      'express', 'cors', 'helmet', 'morgan', 'dotenv',
      'bcryptjs', 'jsonwebtoken', 'joi', 'prisma', '@prisma/client'
    );

    // Generate main server file
    generatedCode.files.push({
      path: 'src/app.js',
      content: this.generateNodeServer(entities, openApiSpec, options),
      type: 'backend'
    });

    // Generate models
    for (const entity of entities) {
      generatedCode.files.push({
        path: `src/models/${entity.name.toLowerCase()}.js`,
        content: this.generateNodeModel(entity, options),
        type: 'backend'
      });
    }

    // Generate controllers
    for (const entity of entities) {
      generatedCode.files.push({
        path: `src/controllers/${entity.name.toLowerCase()}Controller.js`,
        content: this.generateNodeController(entity, openApiSpec, options),
        type: 'backend'
      });
    }

    // Generate routes
    for (const entity of entities) {
      generatedCode.files.push({
        path: `src/routes/${entity.name.toLowerCase()}.js`,
        content: this.generateNodeRoutes(entity, openApiSpec, options),
        type: 'backend'
      });
    }

    // Generate middleware
    if (options.includeAuth) {
      generatedCode.files.push({
        path: 'src/middleware/auth.js',
        content: this.generateNodeAuthMiddleware(options),
        type: 'backend'
      });
    }

    // Generate package.json
    generatedCode.files.push({
      path: 'package.json',
      content: this.generatePackageJson(options),
      type: 'config'
    });
  }

  private async generateLaravelCode(
    entities: Entity[],
    openApiSpec: OpenAPISpec,
    options: CodeGenOptions,
    generatedCode: GeneratedCode
  ): Promise<void> {
    // Generate controllers
    for (const entity of entities) {
      generatedCode.files.push({
        path: `app/Http/Controllers/${entity.name}Controller.php`,
        content: this.generateLaravelController(entity, openApiSpec, options),
        type: 'backend'
      });
    }

    // Generate models
    for (const entity of entities) {
      generatedCode.files.push({
        path: `app/Models/${entity.name}.php`,
        content: this.generateLaravelModel(entity, options),
        type: 'backend'
      });
    }

    // Generate migrations
    for (const entity of entities) {
      generatedCode.files.push({
        path: `database/migrations/${this.getTimestamp()}_create_${entity.name.toLowerCase()}s_table.php`,
        content: this.generateLaravelMigration(entity, options),
        type: 'database'
      });
    }

    // Generate routes
    generatedCode.files.push({
      path: 'routes/api.php',
      content: this.generateLaravelRoutes(entities, openApiSpec, options),
      type: 'backend'
    });
  }

  private async generateJavaCode(
    entities: Entity[],
    openApiSpec: OpenAPISpec,
    options: CodeGenOptions,
    generatedCode: GeneratedCode
  ): Promise<void> {
    // Generate entities
    for (const entity of entities) {
      generatedCode.files.push({
        path: `src/main/java/com/example/entity/${entity.name}.java`,
        content: this.generateJavaEntity(entity, options),
        type: 'backend'
      });
    }

    // Generate repositories
    for (const entity of entities) {
      generatedCode.files.push({
        path: `src/main/java/com/example/repository/${entity.name}Repository.java`,
        content: this.generateJavaRepository(entity, options),
        type: 'backend'
      });
    }

    // Generate services
    for (const entity of entities) {
      generatedCode.files.push({
        path: `src/main/java/com/example/service/${entity.name}Service.java`,
        content: this.generateJavaService(entity, options),
        type: 'backend'
      });
    }

    // Generate controllers
    for (const entity of entities) {
      generatedCode.files.push({
        path: `src/main/java/com/example/controller/${entity.name}Controller.java`,
        content: this.generateJavaController(entity, openApiSpec, options),
        type: 'backend'
      });
    }
  }

  private async generatePythonCode(
    entities: Entity[],
    openApiSpec: OpenAPISpec,
    options: CodeGenOptions,
    generatedCode: GeneratedCode
  ): Promise<void> {
    // Add dependencies
    generatedCode.dependencies.push(
      'fastapi', 'uvicorn', 'sqlalchemy', 'alembic', 'pydantic',
      'python-jose', 'passlib', 'python-multipart'
    );

    // Generate main app file
    generatedCode.files.push({
      path: 'main.py',
      content: this.generateFastAPIApp(entities, openApiSpec, options),
      type: 'backend'
    });

    // Generate models
    for (const entity of entities) {
      generatedCode.files.push({
        path: `models/${entity.name.toLowerCase()}.py`,
        content: this.generateSQLAlchemyModel(entity, options),
        type: 'backend'
      });
    }

    // Generate schemas
    for (const entity of entities) {
      generatedCode.files.push({
        path: `schemas/${entity.name.toLowerCase()}.py`,
        content: this.generatePydanticSchema(entity, options),
        type: 'backend'
      });
    }

    // Generate routers
    for (const entity of entities) {
      generatedCode.files.push({
        path: `routers/${entity.name.toLowerCase()}.py`,
        content: this.generateFastAPIRouter(entity, openApiSpec, options),
        type: 'backend'
      });
    }
  }

  private async generateFrontendCode(
    entities: Entity[],
    openApiSpec: OpenAPISpec,
    options: CodeGenOptions,
    generatedCode: GeneratedCode
  ): Promise<void> {
    switch (options.framework) {
      case 'react':
        await this.generateReactCode(entities, openApiSpec, options, generatedCode);
        break;
      case 'vue':
        await this.generateVueCode(entities, openApiSpec, options, generatedCode);
        break;
      case 'angular':
        await this.generateAngularCode(entities, openApiSpec, options, generatedCode);
        break;
    }
  }

  private async generateReactCode(
    entities: Entity[],
    openApiSpec: OpenAPISpec,
    options: CodeGenOptions,
    generatedCode: GeneratedCode
  ): Promise<void> {
    // Add dependencies
    generatedCode.dependencies.push(
      'react', 'react-dom', 'react-router-dom', 'axios',
      'react-query', 'react-hook-form', 'yup', '@hookform/resolvers'
    );

    // Generate components
    for (const entity of entities) {
      generatedCode.files.push({
        path: `src/components/${entity.name}/${entity.name}List.tsx`,
        content: this.generateReactListComponent(entity, options),
        type: 'frontend'
      });

      generatedCode.files.push({
        path: `src/components/${entity.name}/${entity.name}Form.tsx`,
        content: this.generateReactFormComponent(entity, options),
        type: 'frontend'
      });
    }

    // Generate services
    generatedCode.files.push({
      path: 'src/services/api.ts',
      content: this.generateReactAPIService(entities, openApiSpec, options),
      type: 'frontend'
    });

    // Generate hooks
    for (const entity of entities) {
      generatedCode.files.push({
        path: `src/hooks/use${entity.name}.ts`,
        content: this.generateReactHook(entity, options),
        type: 'frontend'
      });
    }
  }

  private async generateDatabaseCode(
    entities: Entity[],
    options: CodeGenOptions,
    generatedCode: GeneratedCode
  ): Promise<void> {
    if (options.database === 'postgresql' || options.database === 'mysql') {
      // Generate Prisma schema
      generatedCode.files.push({
        path: 'prisma/schema.prisma',
        content: this.generatePrismaSchema(entities, options),
        type: 'database'
      });

      // Generate SQL migrations
      for (const entity of entities) {
        generatedCode.files.push({
          path: `database/migrations/${this.getTimestamp()}_create_${entity.name.toLowerCase()}.sql`,
          content: this.generateSQLMigration(entity, options),
          type: 'database'
        });
      }
    } else if (options.database === 'mongodb') {
      // Generate MongoDB schemas
      for (const entity of entities) {
        generatedCode.files.push({
          path: `schemas/${entity.name.toLowerCase()}.js`,
          content: this.generateMongoSchema(entity, options),
          type: 'database'
        });
      }
    }
  }

  private async generateConfigFiles(
    options: CodeGenOptions,
    generatedCode: GeneratedCode
  ): Promise<void> {
    // Generate environment file
    generatedCode.files.push({
      path: '.env.example',
      content: this.generateEnvExample(options),
      type: 'config'
    });

    // Generate Docker files
    generatedCode.files.push({
      path: 'Dockerfile',
      content: this.generateDockerfile(options),
      type: 'config'
    });

    generatedCode.files.push({
      path: 'docker-compose.yml',
      content: this.generateDockerCompose(options),
      type: 'config'
    });
  }

  private async generateTestFiles(
    entities: Entity[],
    openApiSpec: OpenAPISpec,
    options: CodeGenOptions,
    generatedCode: GeneratedCode
  ): Promise<void> {
    // Generate unit tests
    for (const entity of entities) {
      generatedCode.files.push({
        path: `tests/${entity.name.toLowerCase()}.test.js`,
        content: this.generateUnitTests(entity, options),
        type: 'test'
      });
    }

    // Generate integration tests
    generatedCode.files.push({
      path: 'tests/integration.test.js',
      content: this.generateIntegrationTests(entities, openApiSpec, options),
      type: 'test'
    });
  }

  private async generateDocumentation(
    entities: Entity[],
    openApiSpec: OpenAPISpec,
    options: CodeGenOptions,
    generatedCode: GeneratedCode
  ): Promise<void> {
    // Generate README
    generatedCode.files.push({
      path: 'README.md',
      content: this.generateREADME(entities, openApiSpec, options),
      type: 'docs'
    });

    // Generate API documentation
    generatedCode.files.push({
      path: 'docs/api.md',
      content: this.generateAPIDocumentation(entities, openApiSpec, options),
      type: 'docs'
    });
  }

  private addSetupInstructions(options: CodeGenOptions, generatedCode: GeneratedCode): void {
    const instructions = [
      '1. Install dependencies:',
      `   ${this.getInstallCommand(options.packageManager)}`,
      '',
      '2. Set up environment variables:',
      '   cp .env.example .env',
      '   # Edit .env with your configuration',
      '',
      '3. Set up database:',
      this.getDatabaseSetupInstructions(options),
      '',
      '4. Run the application:',
      this.getRunInstructions(options),
      '',
      '5. Access the application:',
      this.getAccessInstructions(options)
    ];

    generatedCode.instructions = instructions;
  }

  // Template methods (simplified versions)
  private getNodeServerTemplate(): string {
    return `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
// TODO: Add your routes here

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`;
  }

  private getNodeControllerTemplate(): string {
    return `const { {{EntityName}} } = require('../models');

class {{EntityName}}Controller {
  async getAll(req, res) {
    try {
      const {{entityName}}s = await {{EntityName}}.findAll();
      res.json({{entityName}}s);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const {{entityName}} = await {{EntityName}}.findByPk(req.params.id);
      if (!{{entityName}}) {
        return res.status(404).json({ error: '{{EntityName}} not found' });
      }
      res.json({{entityName}});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req, res) {
    try {
      const {{entityName}} = await {{EntityName}}.create(req.body);
      res.status(201).json({{entityName}});
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const {{entityName}} = await {{EntityName}}.findByPk(req.params.id);
      if (!{{entityName}}) {
        return res.status(404).json({ error: '{{EntityName}} not found' });
      }
      await {{entityName}}.update(req.body);
      res.json({{entityName}});
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const {{entityName}} = await {{EntityName}}.findByPk(req.params.id);
      if (!{{entityName}}) {
        return res.status(404).json({ error: '{{EntityName}} not found' });
      }
      await {{entityName}}.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new {{EntityName}}Controller();`;
  }

  // Additional template methods would go here...
  private getNodeModelTemplate(): string { return '// Model template'; }
  private getNodeRouteTemplate(): string { return '// Route template'; }
  private getNodeMiddlewareTemplate(): string { return '// Middleware template'; }
  private getLaravelControllerTemplate(): string { return '// Laravel controller template'; }
  private getLaravelModelTemplate(): string { return '// Laravel model template'; }
  private getLaravelMigrationTemplate(): string { return '// Laravel migration template'; }
  private getLaravelRouteTemplate(): string { return '// Laravel route template'; }
  private getJavaControllerTemplate(): string { return '// Java controller template'; }
  private getJavaEntityTemplate(): string { return '// Java entity template'; }
  private getJavaRepositoryTemplate(): string { return '// Java repository template'; }
  private getJavaServiceTemplate(): string { return '// Java service template'; }
  private getReactComponentTemplate(): string { return '// React component template'; }
  private getReactHookTemplate(): string { return '// React hook template'; }
  private getReactServiceTemplate(): string { return '// React service template'; }
  private getPrismaSchemaTemplate(): string { return '// Prisma schema template'; }
  private getSqlMigrationTemplate(): string { return '// SQL migration template'; }

  // Code generation methods
  private generateNodeServer(entities: Entity[], openApiSpec: OpenAPISpec, options: CodeGenOptions): string {
    return this.templates.get('node-server') || '// Server template';
  }

  private generateNodeModel(entity: Entity, options: CodeGenOptions): string {
    return this.templates.get('node-model')?.replace(/{{EntityName}}/g, entity.name) || '// Model template';
  }

  private generateNodeController(entity: Entity, openApiSpec: OpenAPISpec, options: CodeGenOptions): string {
    return this.templates.get('node-controller')?.replace(/{{EntityName}}/g, entity.name) || '// Controller template';
  }

  private generateNodeRoutes(entity: Entity, openApiSpec: OpenAPISpec, options: CodeGenOptions): string {
    return this.templates.get('node-route') || '// Route template';
  }

  private generateNodeAuthMiddleware(options: CodeGenOptions): string {
    return this.templates.get('node-middleware') || '// Auth middleware template';
  }

  private generatePackageJson(options: CodeGenOptions): string {
    return JSON.stringify({
      name: 'devsync-generated-api',
      version: '1.0.0',
      description: 'Generated API from DevSync',
      main: 'src/app.js',
      scripts: {
        start: 'node src/app.js',
        dev: 'nodemon src/app.js',
        test: 'jest'
      },
      dependencies: {},
      devDependencies: {
        nodemon: '^2.0.20',
        jest: '^29.0.0'
      }
    }, null, 2);
  }

  // Additional generation methods...
  private generateLaravelController(entity: Entity, openApiSpec: OpenAPISpec, options: CodeGenOptions): string { return '// Laravel controller'; }
  private generateLaravelModel(entity: Entity, options: CodeGenOptions): string { return '// Laravel model'; }
  private generateLaravelMigration(entity: Entity, options: CodeGenOptions): string { return '// Laravel migration'; }
  private generateLaravelRoutes(entities: Entity[], openApiSpec: OpenAPISpec, options: CodeGenOptions): string { return '// Laravel routes'; }
  private generateJavaEntity(entity: Entity, options: CodeGenOptions): string { return '// Java entity'; }
  private generateJavaRepository(entity: Entity, options: CodeGenOptions): string { return '// Java repository'; }
  private generateJavaService(entity: Entity, options: CodeGenOptions): string { return '// Java service'; }
  private generateJavaController(entity: Entity, openApiSpec: OpenAPISpec, options: CodeGenOptions): string { return '// Java controller'; }
  private generateFastAPIApp(entities: Entity[], openApiSpec: OpenAPISpec, options: CodeGenOptions): string { return '// FastAPI app'; }
  private generateSQLAlchemyModel(entity: Entity, options: CodeGenOptions): string { return '// SQLAlchemy model'; }
  private generatePydanticSchema(entity: Entity, options: CodeGenOptions): string { return '// Pydantic schema'; }
  private generateFastAPIRouter(entity: Entity, openApiSpec: OpenAPISpec, options: CodeGenOptions): string { return '// FastAPI router'; }
  private generateReactListComponent(entity: Entity, options: CodeGenOptions): string { return '// React list component'; }
  private generateReactFormComponent(entity: Entity, options: CodeGenOptions): string { return '// React form component'; }
  private generateReactAPIService(entities: Entity[], openApiSpec: OpenAPISpec, options: CodeGenOptions): string { return '// React API service'; }
  private generateReactHook(entity: Entity, options: CodeGenOptions): string { return '// React hook'; }
  private generateVueCode(entities: Entity[], openApiSpec: OpenAPISpec, options: CodeGenOptions, generatedCode: GeneratedCode): Promise<void> { return Promise.resolve(); }
  private generateAngularCode(entities: Entity[], openApiSpec: OpenAPISpec, options: CodeGenOptions, generatedCode: GeneratedCode): Promise<void> { return Promise.resolve(); }
  private generatePrismaSchema(entities: Entity[], options: CodeGenOptions): string { return '// Prisma schema'; }
  private generateSQLMigration(entity: Entity, options: CodeGenOptions): string { return '// SQL migration'; }
  private generateMongoSchema(entity: Entity, options: CodeGenOptions): string { return '// MongoDB schema'; }
  private generateEnvExample(options: CodeGenOptions): string { return '// Environment example'; }
  private generateDockerfile(options: CodeGenOptions): string { return '// Dockerfile'; }
  private generateDockerCompose(options: CodeGenOptions): string { return '// Docker compose'; }
  private generateUnitTests(entity: Entity, options: CodeGenOptions): string { return '// Unit tests'; }
  private generateIntegrationTests(entities: Entity[], openApiSpec: OpenAPISpec, options: CodeGenOptions): string { return '// Integration tests'; }
  private generateREADME(entities: Entity[], openApiSpec: OpenAPISpec, options: CodeGenOptions): string { return '// README'; }
  private generateAPIDocumentation(entities: Entity[], openApiSpec: OpenAPISpec, options: CodeGenOptions): string { return '// API documentation'; }

  private getTimestamp(): string {
    return new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
  }

  private getInstallCommand(packageManager: string): string {
    switch (packageManager) {
      case 'npm': return 'npm install';
      case 'yarn': return 'yarn install';
      case 'pnpm': return 'pnpm install';
      case 'composer': return 'composer install';
      case 'maven': return 'mvn install';
      case 'gradle': return './gradlew build';
      case 'pip': return 'pip install -r requirements.txt';
      default: return 'npm install';
    }
  }

  private getDatabaseSetupInstructions(options: CodeGenOptions): string {
    switch (options.database) {
      case 'postgresql':
        return '   npx prisma migrate dev\n   npx prisma generate';
      case 'mysql':
        return '   npx prisma migrate dev\n   npx prisma generate';
      case 'mongodb':
        return '   # MongoDB setup instructions';
      default:
        return '   # Database setup instructions';
    }
  }

  private getRunInstructions(options: CodeGenOptions): string {
    switch (options.framework) {
      case 'node': return '   npm run dev';
      case 'laravel': return '   php artisan serve';
      case 'java': return '   ./mvnw spring-boot:run';
      case 'python': return '   uvicorn main:app --reload';
      case 'react': return '   npm start';
      case 'vue': return '   npm run serve';
      case 'angular': return '   ng serve';
      default: return '   npm run dev';
    }
  }

  private getAccessInstructions(options: CodeGenOptions): string {
    switch (options.framework) {
      case 'node': return '   http://localhost:3000';
      case 'laravel': return '   http://localhost:8000';
      case 'java': return '   http://localhost:8080';
      case 'python': return '   http://localhost:8000';
      case 'react': return '   http://localhost:3000';
      case 'vue': return '   http://localhost:8080';
      case 'angular': return '   http://localhost:4200';
      default: return '   http://localhost:3000';
    }
  }
}
