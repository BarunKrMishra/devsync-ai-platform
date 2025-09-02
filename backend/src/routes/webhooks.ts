import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { logger } from '@/config/logger'
import { asyncHandler } from '@/middleware/errorHandler'

const router = Router()

/**
 * @swagger
 * /api/webhooks/slack:
 *   post:
 *     summary: Slack webhook endpoint
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook data
 */
router.post('/slack',
  [
    body().isObject().withMessage('Webhook data must be an object')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const webhookData = req.body

    logger.info('Slack webhook received', {
      type: webhookData.type,
      challenge: webhookData.challenge
    })

    // Handle Slack URL verification challenge
    if (webhookData.type === 'url_verification') {
      return res.json({
        challenge: webhookData.challenge
      })
    }

    // Process other webhook events
    if (webhookData.type === 'event_callback') {
      const event = webhookData.event
      
      logger.info('Slack event received', {
        eventType: event.type,
        channel: event.channel,
        user: event.user
      })

      // Process the event here
      // For example, update project status, send notifications, etc.
    }

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    })
  })
)

/**
 * @swagger
 * /api/webhooks/github:
 *   post:
 *     summary: GitHub webhook endpoint
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook data
 */
router.post('/github',
  [
    body().isObject().withMessage('Webhook data must be an object')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const webhookData = req.body
    const eventType = req.headers['x-github-event']

    logger.info('GitHub webhook received', {
      eventType,
      action: webhookData.action,
      repository: webhookData.repository?.name
    })

    // Process GitHub webhook events
    switch (eventType) {
      case 'push':
        // Handle code push events
        logger.info('Code push detected', {
          repository: webhookData.repository.name,
          branch: webhookData.ref,
          commits: webhookData.commits.length
        })
        break

      case 'pull_request':
        // Handle pull request events
        logger.info('Pull request event', {
          action: webhookData.action,
          repository: webhookData.repository.name,
          number: webhookData.pull_request.number
        })
        break

      case 'issues':
        // Handle issue events
        logger.info('Issue event', {
          action: webhookData.action,
          repository: webhookData.repository.name,
          number: webhookData.issue.number
        })
        break

      default:
        logger.info('Unhandled GitHub event type', { eventType })
    }

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    })
  })
)

export default router
