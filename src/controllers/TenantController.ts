import type { NextFunction, Response } from 'express'
import type { TenantService } from '../services/TenantService.js'
import type { Logger } from 'winston'
import type { createTenantRequest } from '../types/index.js'

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger
    ) {}

    async createTenant(
        req: createTenantRequest,
        res: Response,
        next: NextFunction
    ) {
        try {
            const { name, address } = req.body
            const tenant = await this.tenantService.createTenant({
                name,
                address,
            })
            this.logger.info(`Tenant created successfully: ${tenant.id}`)
            res.status(201).json({
                message: 'Tenant created successfully',
                id: tenant.id,
            })
        } catch (error) {
            next(error)
        }
    }
}
