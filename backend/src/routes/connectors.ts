import { Router } from 'express'
import { body, param, validationResult } from 'express-validator'
import { ApiConnectorService, ConnectorType, AuthType } from '@/services/apiConnectorService'
import { asyncHandler } from '@/middleware/errorHandler'
import { AuthRequest } from '@/middleware/auth'
import { logger } from '@/config/logger'

const router = Router()
const connectorService = new ApiConnectorService()

/**
 * @swagger
 * /api/connectors:
 *   get:
 *     summary: List all available connectors
 *     tags: [Connectors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of connectors
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
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                       baseUrl:
 *                         type: string
 *                       authType:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const connectors = connectorService.listConnectors()
  
  res.json({
    success: true,
    data: connectors.map(connector => ({
      id: connector.id,
      name: connector.name,
      type: connector.type,
      baseUrl: connector.baseUrl,
      authType: connector.authType,
      rateLimit: connector.rateLimit,
      retryConfig: connector.retryConfig
    }))
  })
}))

/**
 * @swagger
 * /api/connectors/{connectorId}:
 *   get:
 *     summary: Get connector details
 *     tags: [Connectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: connectorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Connector ID
 *     responses:
 *       200:
 *         description: Connector details
 *       404:
 *         description: Connector not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:connectorId',
  [
    param('connectorId').isString().notEmpty().withMessage('Connector ID is required')
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

    const { connectorId } = req.params
    const connector = connectorService.getConnector(connectorId)

    if (!connector) {
      return res.status(404).json({
        success: false,
        error: 'Connector not found'
      })
    }

    res.json({
      success: true,
      data: {
        id: connector.id,
        name: connector.name,
        type: connector.type,
        baseUrl: connector.baseUrl,
        authType: connector.authType,
        rateLimit: connector.rateLimit,
        retryConfig: connector.retryConfig
      }
    })
  })
)

/**
 * @swagger
 * /api/connectors/{connectorId}/test:
 *   post:
 *     summary: Test connector connection
 *     tags: [Connectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: connectorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Connector ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               credentials:
 *                 type: object
 *                 description: Connector credentials
 *     responses:
 *       200:
 *         description: Connection test result
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/:connectorId/test',
  [
    param('connectorId').isString().notEmpty().withMessage('Connector ID is required'),
    body('credentials').isObject().withMessage('Credentials must be an object')
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

    const { connectorId } = req.params
    const { credentials } = req.body

    logger.info('Testing connector connection', {
      userId: req.user?.id,
      connectorId
    })

    // Temporarily update connector credentials for testing
    const connector = connectorService.getConnector(connectorId)
    if (!connector) {
      return res.status(404).json({
        success: false,
        error: 'Connector not found'
      })
    }

    // Update credentials temporarily
    const originalCredentials = connector.credentials
    connector.credentials = credentials

    try {
      const isConnected = await connectorService.testConnection(connectorId)
      
      // Restore original credentials
      connector.credentials = originalCredentials

      res.json({
        success: true,
        data: {
          connected: isConnected,
          message: isConnected ? 'Connection successful' : 'Connection failed'
        }
      })
    } catch (error) {
      // Restore original credentials
      connector.credentials = originalCredentials
      
      logger.error('Connector test failed', {
        userId: req.user?.id,
        connectorId,
        error: error.message
      })

      res.json({
        success: true,
        data: {
          connected: false,
          message: error.message
        }
      })
    }
  })
)

/**
 * @swagger
 * /api/connectors/{connectorId}/request:
 *   post:
 *     summary: Make a request through a connector
 *     tags: [Connectors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: connectorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Connector ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - method
 *               - endpoint
 *             properties:
 *               method:
 *                 type: string
 *                 enum: [GET, POST, PUT, DELETE, PATCH]
 *               endpoint:
 *                 type: string
 *                 description: API endpoint path
 *               data:
 *                 type: object
 *                 description: Request body data
 *               credentials:
 *                 type: object
 *                 description: Connector credentials
 *     responses:
 *       200:
 *         description: Request successful
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Request failed
 */
router.post('/:connectorId/request',
  [
    param('connectorId').isString().notEmpty().withMessage('Connector ID is required'),
    body('method').isIn(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).withMessage('Method must be one of: GET, POST, PUT, DELETE, PATCH'),
    body('endpoint').isString().notEmpty().withMessage('Endpoint is required'),
    body('data').optional().isObject().withMessage('Data must be an object'),
    body('credentials').optional().isObject().withMessage('Credentials must be an object')
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

    const { connectorId } = req.params
    const { method, endpoint, data, credentials } = req.body

    logger.info('Making connector request', {
      userId: req.user?.id,
      connectorId,
      method,
      endpoint
    })

    // Update credentials if provided
    if (credentials) {
      const connector = connectorService.getConnector(connectorId)
      if (connector) {
        connector.credentials = credentials
      }
    }

    try {
      const result = await connectorService.makeRequest(
        connectorId,
        method,
        endpoint,
        data
      )

      logger.info('Connector request successful', {
        userId: req.user?.id,
        connectorId,
        method,
        endpoint,
        status: result.status,
        duration: result.metadata.duration
      })

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      logger.error('Connector request failed', {
        userId: req.user?.id,
        connectorId,
        method,
        endpoint,
        error: error.message
      })

      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  })
)

/**
 * @swagger
 * /api/connectors/slack/message:
 *   post:
 *     summary: Send Slack message
 *     tags: [Connectors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - channel
 *               - text
 *             properties:
 *               channel:
 *                 type: string
 *                 description: Slack channel
 *               text:
 *                 type: string
 *                 description: Message text
 *               credentials:
 *                 type: object
 *                 description: Slack credentials
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/slack/message',
  [
    body('channel').isString().notEmpty().withMessage('Channel is required'),
    body('text').isString().notEmpty().withMessage('Text is required'),
    body('credentials').optional().isObject().withMessage('Credentials must be an object')
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

    const { channel, text, credentials, ...options } = req.body

    logger.info('Sending Slack message', {
      userId: req.user?.id,
      channel
    })

    // Update credentials if provided
    if (credentials) {
      const connector = connectorService.getConnector('slack')
      if (connector) {
        connector.credentials = credentials
      }
    }

    try {
      const result = await connectorService.sendSlackMessage(channel, text, options)

      logger.info('Slack message sent successfully', {
        userId: req.user?.id,
        channel,
        status: result.status
      })

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      logger.error('Slack message failed', {
        userId: req.user?.id,
        channel,
        error: error.message
      })

      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  })
)

/**
 * @swagger
 * /api/connectors/email/send:
 *   post:
 *     summary: Send email via SendGrid
 *     tags: [Connectors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - subject
 *               - content
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *                 description: Recipient email
 *               subject:
 *                 type: string
 *                 description: Email subject
 *               content:
 *                 type: string
 *                 description: Email content
 *               from:
 *                 type: string
 *                 format: email
 *                 description: Sender email
 *               credentials:
 *                 type: object
 *                 description: SendGrid credentials
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/email/send',
  [
    body('to').isEmail().withMessage('Valid email address is required'),
    body('subject').isString().notEmpty().withMessage('Subject is required'),
    body('content').isString().notEmpty().withMessage('Content is required'),
    body('from').optional().isEmail().withMessage('Valid email address is required'),
    body('credentials').optional().isObject().withMessage('Credentials must be an object')
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

    const { to, subject, content, from, credentials } = req.body

    logger.info('Sending email', {
      userId: req.user?.id,
      to,
      subject
    })

    // Update credentials if provided
    if (credentials) {
      const connector = connectorService.getConnector('sendgrid')
      if (connector) {
        connector.credentials = credentials
      }
    }

    try {
      const result = await connectorService.sendEmail(to, subject, content, from)

      logger.info('Email sent successfully', {
        userId: req.user?.id,
        to,
        subject,
        status: result.status
      })

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      logger.error('Email sending failed', {
        userId: req.user?.id,
        to,
        subject,
        error: error.message
      })

      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  })
)

export default router
