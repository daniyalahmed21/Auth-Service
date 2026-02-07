import { Router, type NextFunction, type Request, type Response } from 'express'
import logger from '../config/logger.js'
import { AppDataSource } from '../config/data-source.js'
import { Tenant } from '../entity/Tenant.js'
import { TenantService } from '../services/TenantService.js'
import { TenantController } from '../controllers/TenantController.js'

const router = Router()

const tenantRepository = AppDataSource.getRepository(Tenant)
const tenantService = new TenantService(tenantRepository)
const tenantController = new TenantController(tenantService, logger)

router.post('/', (req: Request, res: Response, next: NextFunction) =>
    tenantController.createTenant(req, res, next)
)

export default router
