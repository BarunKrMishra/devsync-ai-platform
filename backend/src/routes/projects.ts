import { Router } from 'express'
import { body, param, query, validationResult } from 'express-validator'
import { prisma } from '@/config/database'
import { asyncHandler, CustomError } from '@/middleware/errorHandler'
import { AuthRequest } from '@/middleware/auth'
import { logger } from '@/config/logger'

const router = Router()

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get user's projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, ACTIVE, ARCHIVED, DELETED]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of projects
 *       401:
 *         description: Unauthorized
 */
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['DRAFT', 'ACTIVE', 'ARCHIVED', 'DELETED']).withMessage('Invalid status'),
    query('search').optional().isString().withMessage('Search must be a string')
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

    const { page = 1, limit = 20, status, search } = req.query
    const userId = req.user!.id

    const skip = (Number(page) - 1) * Number(limit)

    const where: any = {
      userId,
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ]
      })
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { updatedAt: 'desc' },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          _count: {
            select: {
              requirements: true,
              erds: true,
              apis: true,
              connectors: true
            }
          }
        }
      }),
      prisma.project.count({ where })
    ])

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    })
  })
)

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               organizationId:
 *                 type: string
 *               visibility:
 *                 type: string
 *                 enum: [PRIVATE, ORGANIZATION, PUBLIC]
 *                 default: PRIVATE
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/',
  [
    body('name').isString().isLength({ min: 1, max: 255 }).withMessage('Name is required and must be less than 255 characters'),
    body('description').optional().isString().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('organizationId').optional().isString().withMessage('Organization ID must be a string'),
    body('visibility').optional().isIn(['PRIVATE', 'ORGANIZATION', 'PUBLIC']).withMessage('Invalid visibility')
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

    const { name, description, organizationId, visibility = 'PRIVATE' } = req.body
    const userId = req.user!.id

    // Check organization membership if organizationId is provided
    if (organizationId) {
      const membership = await prisma.organizationMember.findFirst({
        where: {
          organizationId,
          userId
        }
      })

      if (!membership) {
        throw new CustomError('You are not a member of this organization', 403)
      }
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        organizationId,
        userId,
        visibility
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    logger.info('Project created successfully', {
      userId,
      projectId: project.id,
      name: project.name
    })

    res.status(201).json({
      success: true,
      data: project
    })
  })
)

/**
 * @swagger
 * /api/projects/{projectId}:
 *   get:
 *     summary: Get project details
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project details
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:projectId',
  [
    param('projectId').isString().withMessage('Project ID is required')
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

    const { projectId } = req.params
    const userId = req.user!.id

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          { organization: { members: { some: { userId } } } }
        ]
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        requirements: {
          orderBy: { createdAt: 'desc' }
        },
        erds: {
          orderBy: { createdAt: 'desc' }
        },
        apis: {
          orderBy: { createdAt: 'desc' }
        },
        connectors: {
          orderBy: { createdAt: 'desc' }
        },
        deployments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!project) {
      throw new CustomError('Project not found', 404)
    }

    res.json({
      success: true,
      data: project
    })
  })
)

/**
 * @swagger
 * /api/projects/{projectId}:
 *   put:
 *     summary: Update project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, ACTIVE, ARCHIVED, DELETED]
 *               visibility:
 *                 type: string
 *                 enum: [PRIVATE, ORGANIZATION, PUBLIC]
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:projectId',
  [
    param('projectId').isString().withMessage('Project ID is required'),
    body('name').optional().isString().isLength({ min: 1, max: 255 }).withMessage('Name must be less than 255 characters'),
    body('description').optional().isString().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('status').optional().isIn(['DRAFT', 'ACTIVE', ARCHIVED', 'DELETED']).withMessage('Invalid status'),
    body('visibility').optional().isIn(['PRIVATE', 'ORGANIZATION', 'PUBLIC']).withMessage('Invalid visibility')
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

    const { projectId } = req.params
    const userId = req.user!.id
    const updateData = req.body

    // Check if user has access to the project
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          { organization: { members: { some: { userId } } } }
        ]
      }
    })

    if (!existingProject) {
      throw new CustomError('Project not found', 404)
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    logger.info('Project updated successfully', {
      userId,
      projectId: project.id,
      updates: Object.keys(updateData)
    })

    res.json({
      success: true,
      data: project
    })
  })
)

/**
 * @swagger
 * /api/projects/{projectId}:
 *   delete:
 *     summary: Delete project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:projectId',
  [
    param('projectId').isString().withMessage('Project ID is required')
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

    const { projectId } = req.params
    const userId = req.user!.id

    // Check if user owns the project
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId
      }
    })

    if (!existingProject) {
      throw new CustomError('Project not found or you do not have permission to delete it', 404)
    }

    await prisma.project.delete({
      where: { id: projectId }
    })

    logger.info('Project deleted successfully', {
      userId,
      projectId
    })

    res.json({
      success: true,
      message: 'Project deleted successfully'
    })
  })
)

export default router
