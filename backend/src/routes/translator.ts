import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { AITranslatorService } from '@/services/aiTranslatorService'
import { asyncHandler } from '@/middleware/errorHandler'
import { AuthRequest } from '@/middleware/auth'
import { logger } from '@/config/logger'

const router = Router()
const aiTranslator = new AITranslatorService()

/**
 * @swagger
 * /api/translator/translate:
 *   post:
 *     summary: Translate requirements to ERD, OpenAPI, and code
 *     tags: [Translator]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requirements
 *             properties:
 *               requirements:
 *                 type: string
 *                 description: Natural language requirements
 *               framework:
 *                 type: string
 *                 enum: [node, laravel, java, python]
 *                 default: node
 *               database:
 *                 type: string
 *                 enum: [postgresql, mysql, mongodb]
 *                 default: postgresql
 *               includeAuth:
 *                 type: boolean
 *                 default: true
 *               includeTests:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Translation successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     entities:
 *                       type: array
 *                       items:
 *                         type: object
 *                     openApiSpec:
 *                       type: object
 *                     testCases:
 *                       type: array
 *                     codeTemplates:
 *                       type: object
 *                     recommendations:
 *                       type: array
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/translate',
  [
    body('requirements')
      .isString()
      .isLength({ min: 10, max: 10000 })
      .withMessage('Requirements must be between 10 and 10000 characters'),
    body('framework')
      .optional()
      .isIn(['node', 'laravel', 'java', 'python'])
      .withMessage('Framework must be one of: node, laravel, java, python'),
    body('database')
      .optional()
      .isIn(['postgresql', 'mysql', 'mongodb'])
      .withMessage('Database must be one of: postgresql, mysql, mongodb'),
    body('includeAuth')
      .optional()
      .isBoolean()
      .withMessage('includeAuth must be a boolean'),
    body('includeTests')
      .optional()
      .isBoolean()
      .withMessage('includeTests must be a boolean')
  ],
  asyncHandler(async (req: AuthRequest, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const { requirements, framework, database, includeAuth, includeTests } = req.body

    logger.info('Starting translation request', {
      userId: req.user?.id,
      framework,
      database,
      includeAuth,
      includeTests,
      requirementsLength: requirements.length
    })

    const result = await aiTranslator.translateRequirements(requirements, {
      framework,
      database,
      includeAuth,
      includeTests
    })

    logger.info('Translation completed successfully', {
      userId: req.user?.id,
      entitiesCount: result.entities.length,
      testCasesCount: result.testCases.length,
      recommendationsCount: result.recommendations.length
    })

    res.json({
      success: true,
      data: result
    })
  })
)

/**
 * @swagger
 * /api/translator/validate:
 *   post:
 *     summary: Validate requirements for completeness and clarity
 *     tags: [Translator]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requirements
 *             properties:
 *               requirements:
 *                 type: string
 *                 description: Natural language requirements to validate
 *     responses:
 *       200:
 *         description: Validation completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     isValid:
 *                       type: boolean
 *                     issues:
 *                       type: array
 *                       items:
 *                         type: string
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/validate',
  [
    body('requirements')
      .isString()
      .isLength({ min: 10, max: 10000 })
      .withMessage('Requirements must be between 10 and 10000 characters')
  ],
  asyncHandler(async (req: AuthRequest, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const { requirements } = req.body

    logger.info('Starting requirements validation', {
      userId: req.user?.id,
      requirementsLength: requirements.length
    })

    const result = await aiTranslator.validateRequirements(requirements)

    logger.info('Requirements validation completed', {
      userId: req.user?.id,
      isValid: result.isValid,
      issuesCount: result.issues.length,
      suggestionsCount: result.suggestions.length
    })

    res.json({
      success: true,
      data: result
    })
  })
)

/**
 * @swagger
 * /api/translator/entities:
 *   post:
 *     summary: Extract entities from requirements
 *     tags: [Translator]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requirements
 *             properties:
 *               requirements:
 *                 type: string
 *                 description: Natural language requirements
 *     responses:
 *       200:
 *         description: Entities extracted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       attributes:
 *                         type: array
 *                       relationships:
 *                         type: array
 *                       description:
 *                         type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/entities',
  [
    body('requirements')
      .isString()
      .isLength({ min: 10, max: 10000 })
      .withMessage('Requirements must be between 10 and 10000 characters')
  ],
  asyncHandler(async (req: AuthRequest, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const { requirements } = req.body

    logger.info('Starting entity extraction', {
      userId: req.user?.id,
      requirementsLength: requirements.length
    })

    const entities = await aiTranslator.extractEntities(requirements)

    logger.info('Entity extraction completed', {
      userId: req.user?.id,
      entitiesCount: entities.length
    })

    res.json({
      success: true,
      data: entities
    })
  })
)

/**
 * @swagger
 * /api/translator/openapi:
 *   post:
 *     summary: Generate OpenAPI specification from entities
 *     tags: [Translator]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - entities
 *               - requirements
 *             properties:
 *               entities:
 *                 type: array
 *                 description: Array of entities
 *               requirements:
 *                 type: string
 *                 description: Original requirements
 *               framework:
 *                 type: string
 *                 enum: [node, laravel, java, python]
 *                 default: node
 *               database:
 *                 type: string
 *                 enum: [postgresql, mysql, mongodb]
 *                 default: postgresql
 *               includeAuth:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: OpenAPI specification generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   description: OpenAPI 3.0 specification
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/openapi',
  [
    body('entities')
      .isArray({ min: 1 })
      .withMessage('Entities must be a non-empty array'),
    body('requirements')
      .isString()
      .isLength({ min: 10, max: 10000 })
      .withMessage('Requirements must be between 10 and 10000 characters'),
    body('framework')
      .optional()
      .isIn(['node', 'laravel', 'java', 'python'])
      .withMessage('Framework must be one of: node, laravel, java, python'),
    body('database')
      .optional()
      .isIn(['postgresql', 'mysql', 'mongodb'])
      .withMessage('Database must be one of: postgresql, mysql, mongodb'),
    body('includeAuth')
      .optional()
      .isBoolean()
      .withMessage('includeAuth must be a boolean')
  ],
  asyncHandler(async (req: AuthRequest, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const { entities, requirements, framework, database, includeAuth } = req.body

    logger.info('Starting OpenAPI generation', {
      userId: req.user?.id,
      entitiesCount: entities.length,
      framework,
      database,
      includeAuth
    })

    const openApiSpec = await aiTranslator.generateOpenAPISpec(entities, requirements, {
      framework,
      database,
      includeAuth
    })

    logger.info('OpenAPI generation completed', {
      userId: req.user?.id,
      pathsCount: Object.keys(openApiSpec.paths || {}).length
    })

    res.json({
      success: true,
      data: openApiSpec
    })
  })
)

export default router
