import express, {
    type NextFunction,
    type Request,
    type RequestHandler,
    type Response,
} from 'express'
import { TenantController } from '../controllers/TenantController.js'
import { TenantService } from '../services/TenantService.js'
import { AppDataSource } from '../config/data-source.js'
import { Tenant } from '../entity/Tenant.js'
import logger from '../config/logger.js'

import type { createTenantRequest } from '../types/index.js'
import { ROLES } from '../constants/index.js'
import { authenticate } from '../middleware/authenticate.js'
import { canAccess } from '../middleware/canAccess.js'
import tenantValidator from '../validators/tenantValidator.js'
import listUserValidator from '../validators/listUserValidator.js'

const router = express.Router()

const tenantRepository = AppDataSource.getRepository(Tenant)
const tenantService = new TenantService(tenantRepository)
const tenantController = new TenantController(tenantService, logger)

router.post(
    '/',
    authenticate,
    canAccess([ROLES.ADMIN]),
    tenantValidator,
    (req: createTenantRequest, res: Response, next: NextFunction) =>
        tenantController.create(req, res, next) as unknown as RequestHandler
)

router.patch(
    '/:id',
    authenticate,
    canAccess([ROLES.ADMIN]),
    tenantValidator,
    (req: createTenantRequest, res: Response, next: NextFunction) =>
        tenantController.update(req, res, next) as unknown as RequestHandler
)
router.get(
    '/',
    listUserValidator,
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.getAll(req, res, next) as unknown as RequestHandler
)
router.get(
    '/:id',
    authenticate,
    canAccess([ROLES.ADMIN]),
    (req, res, next) =>
        tenantController.getOne(req, res, next) as unknown as RequestHandler
)
router.delete(
    '/:id',
    authenticate,
    canAccess([ROLES.ADMIN]),
    (req, res, next) =>
        tenantController.destroy(req, res, next) as unknown as RequestHandler
)

export default router
