import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { config } from '@/config/config'
import { logger } from '@/config/logger'

export interface Entity {
  name: string
  attributes: Attribute[]
  relationships: Relationship[]
  description?: string
}

export interface Attribute {
  name: string
  type: string
  required: boolean
  unique?: boolean
  description?: string
  constraints?: string[]
}

export interface Relationship {
  target: string
  type: 'one-to-one' | 'one-to-many' | 'many-to-many'
  description?: string
}

export interface OpenAPISpec {
  openapi: string
  info: {
    title: string
    version: string
    description?: string
  }
  servers: Array<{
    url: string
    description?: string
  }>
  paths: Record<string, any>
  components: {
    schemas: Record<string, any>
    securitySchemes: Record<string, any>
  }
}

export interface TestCase {
  name: string
  description: string
  type: 'unit' | 'integration' | 'e2e'
  steps: string[]
  expectedResult: string
}

export interface TranslationResult {
  entities: Entity[]
  openApiSpec: OpenAPISpec
  testCases: TestCase[]
  codeTemplates: {
    backend: string
    frontend: string
    database: string
  }
  recommendations: string[]
}

export class AITranslatorService {
  private openai: OpenAI
  private anthropic: Anthropic

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.ai.openai.apiKey
    })

    this.anthropic = new Anthropic({
      apiKey: config.ai.anthropic.apiKey
    })
  }

  async translateRequirements(
    requirements: string,
    options: {
      framework?: 'node' | 'laravel' | 'java' | 'python'
      database?: 'postgresql' | 'mysql' | 'mongodb'
      includeAuth?: boolean
      includeTests?: boolean
    } = {}
  ): Promise<TranslationResult> {
    try {
      logger.info('Starting AI translation process', { requirements: requirements.substring(0, 100) })

      // Step 1: Extract entities and relationships
      const entities = await this.extractEntities(requirements)
      logger.info('Extracted entities', { count: entities.length })

      // Step 2: Generate OpenAPI specification
      const openApiSpec = await this.generateOpenAPISpec(entities, requirements, options)
      logger.info('Generated OpenAPI specification')

      // Step 3: Generate test cases
      const testCases = options.includeTests ? await this.generateTestCases(entities, openApiSpec) : []
      logger.info('Generated test cases', { count: testCases.length })

      // Step 4: Generate code templates
      const codeTemplates = await this.generateCodeTemplates(entities, openApiSpec, options)
      logger.info('Generated code templates')

      // Step 5: Generate recommendations
      const recommendations = await this.generateRecommendations(entities, openApiSpec, options)
      logger.info('Generated recommendations', { count: recommendations.length })

      return {
        entities,
        openApiSpec,
        testCases,
        codeTemplates,
        recommendations
      }

    } catch (error) {
      logger.error('AI translation failed:', error)
      throw new Error('Failed to translate requirements: ' + error.message)
    }
  }

  private async extractEntities(requirements: string): Promise<Entity[]> {
    const prompt = `
You are an expert database designer. Analyze the following requirements and extract entities, their attributes, and relationships.

Requirements:
${requirements}

Return a JSON array of entities with the following structure:
[
  {
    "name": "EntityName",
    "description": "Brief description of the entity",
    "attributes": [
      {
        "name": "attributeName",
        "type": "string|integer|boolean|date|email|url|text",
        "required": true/false,
        "unique": true/false,
        "description": "Description of the attribute",
        "constraints": ["constraint1", "constraint2"]
      }
    ],
    "relationships": [
      {
        "target": "RelatedEntityName",
        "type": "one-to-one|one-to-many|many-to-many",
        "description": "Description of the relationship"
      }
    ]
  }
]

Focus on:
1. Identifying core business entities
2. Determining appropriate data types
3. Establishing relationships between entities
4. Adding necessary constraints and validations
5. Including common fields like id, createdAt, updatedAt where appropriate

Return only valid JSON, no additional text.
`

    try {
      const response = await this.openai.chat.completions.create({
        model: config.ai.openai.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 4000
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      return JSON.parse(content)
    } catch (error) {
      logger.error('Entity extraction failed:', error)
      throw new Error('Failed to extract entities: ' + error.message)
    }
  }

  private async generateOpenAPISpec(
    entities: Entity[],
    requirements: string,
    options: any
  ): Promise<OpenAPISpec> {
    const prompt = `
You are an expert API designer. Create a comprehensive OpenAPI 3.0 specification based on the entities and requirements.

Entities:
${JSON.stringify(entities, null, 2)}

Requirements:
${requirements}

Framework: ${options.framework || 'node'}
Database: ${options.database || 'postgresql'}
Include Auth: ${options.includeAuth || false}

Generate a complete OpenAPI 3.0 specification with:
1. All CRUD operations for each entity
2. Proper HTTP status codes
3. Request/response schemas
4. Authentication (if includeAuth is true)
5. Validation rules
6. Error responses
7. API documentation

Return only valid OpenAPI 3.0 JSON specification, no additional text.
`

    try {
      const response = await this.openai.chat.completions.create({
        model: config.ai.openai.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 6000
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      return JSON.parse(content)
    } catch (error) {
      logger.error('OpenAPI generation failed:', error)
      throw new Error('Failed to generate OpenAPI spec: ' + error.message)
    }
  }

  private async generateTestCases(
    entities: Entity[],
    openApiSpec: OpenAPISpec
  ): Promise<TestCase[]> {
    const prompt = `
You are an expert QA engineer. Generate comprehensive test cases for the API specification.

Entities:
${JSON.stringify(entities, null, 2)}

OpenAPI Spec:
${JSON.stringify(openApiSpec, null, 2)}

Generate test cases covering:
1. Unit tests for each endpoint
2. Integration tests for entity relationships
3. End-to-end tests for complete workflows
4. Error handling tests
5. Authentication/authorization tests
6. Validation tests

Return a JSON array of test cases with this structure:
[
  {
    "name": "Test Case Name",
    "description": "What this test verifies",
    "type": "unit|integration|e2e",
    "steps": ["Step 1", "Step 2", "Step 3"],
    "expectedResult": "Expected outcome"
  }
]

Return only valid JSON, no additional text.
`

    try {
      const response = await this.openai.chat.completions.create({
        model: config.ai.openai.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 4000
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      return JSON.parse(content)
    } catch (error) {
      logger.error('Test case generation failed:', error)
      throw new Error('Failed to generate test cases: ' + error.message)
    }
  }

  private async generateCodeTemplates(
    entities: Entity[],
    openApiSpec: OpenAPISpec,
    options: any
  ): Promise<{ backend: string; frontend: string; database: string }> {
    const framework = options.framework || 'node'
    const database = options.database || 'postgresql'

    const prompt = `
You are an expert full-stack developer. Generate production-ready code templates based on the entities and OpenAPI specification.

Entities:
${JSON.stringify(entities, null, 2)}

OpenAPI Spec:
${JSON.stringify(openApiSpec, null, 2)}

Framework: ${framework}
Database: ${database}

Generate code templates for:
1. Backend: Complete server implementation with routes, models, controllers, middleware
2. Frontend: React components with forms, tables, and API integration
3. Database: Migration scripts and seed data

For ${framework} backend, include:
- Express.js routes and controllers
- Database models (Prisma/Sequelize/Mongoose)
- Authentication middleware
- Validation middleware
- Error handling
- Environment configuration

For frontend, include:
- React components with TypeScript
- API service layer
- Form handling with validation
- State management
- Responsive design

For database, include:
- Migration scripts
- Seed data
- Indexes and constraints

Return a JSON object with this structure:
{
  "backend": "Complete backend code as string",
  "frontend": "Complete frontend code as string", 
  "database": "Complete database scripts as string"
}

Return only valid JSON, no additional text.
`

    try {
      const response = await this.openai.chat.completions.create({
        model: config.ai.openai.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 8000
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      return JSON.parse(content)
    } catch (error) {
      logger.error('Code template generation failed:', error)
      throw new Error('Failed to generate code templates: ' + error.message)
    }
  }

  private async generateRecommendations(
    entities: Entity[],
    openApiSpec: OpenAPISpec,
    options: any
  ): Promise<string[]> {
    const prompt = `
You are an expert software architect. Analyze the entities and API specification and provide recommendations for improvement.

Entities:
${JSON.stringify(entities, null, 2)}

OpenAPI Spec:
${JSON.stringify(openApiSpec, null, 2)}

Options: ${JSON.stringify(options, null, 2)}

Provide recommendations for:
1. Performance optimizations
2. Security improvements
3. Scalability considerations
4. Best practices
5. Additional features
6. Database optimizations
7. API design improvements
8. Monitoring and observability

Return a JSON array of recommendation strings, no additional text.
`

    try {
      const response = await this.openai.chat.completions.create({
        model: config.ai.openai.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 2000
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      return JSON.parse(content)
    } catch (error) {
      logger.error('Recommendation generation failed:', error)
      throw new Error('Failed to generate recommendations: ' + error.message)
    }
  }

  async validateRequirements(requirements: string): Promise<{
    isValid: boolean
    issues: string[]
    suggestions: string[]
  }> {
    const prompt = `
You are an expert business analyst. Validate the following requirements for completeness and clarity.

Requirements:
${requirements}

Check for:
1. Missing information
2. Ambiguous statements
3. Inconsistencies
4. Technical feasibility
5. Business logic completeness

Return a JSON object with this structure:
{
  "isValid": true/false,
  "issues": ["Issue 1", "Issue 2"],
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}

Return only valid JSON, no additional text.
`

    try {
      const response = await this.openai.chat.completions.create({
        model: config.ai.openai.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      return JSON.parse(content)
    } catch (error) {
      logger.error('Requirements validation failed:', error)
      throw new Error('Failed to validate requirements: ' + error.message)
    }
  }
}
