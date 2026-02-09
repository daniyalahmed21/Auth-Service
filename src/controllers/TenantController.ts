import type { NextFunction, Request, Response } from 'express'
import type { Logger } from 'winston'
import { matchedData } from 'express-validator'
import type { CreateTenantRequest, TenantQueryParams } from '../types/index.js'
import type { TenantService } from '../services/TenantService.js'
import createHttpError from 'http-errors'
import { validateNumericId } from '../utils/validationHelper.js'

export class TenantController {
    constructor(
        private readonly tenantService: TenantService,
        private readonly logger: Logger
    ) {}

    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const { name, address } = req.body
        this.logger.debug('Request for creating a tenant', req.body)

        try {
            const tenant = await this.tenantService.create({ name, address })
            this.logger.info('Tenant has been created', { id: tenant.id })

            res.status(201).json({ id: tenant.id })
        } catch (err) {
            next(err)
        }
    }

    async update(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const { name, address } = req.body

        try {
            const tenantId = validateNumericId(req.params.id)
            this.logger.debug('Request for updating a tenant', req.body)

            await this.tenantService.update(tenantId, {
                name,
                address,
            })

            this.logger.info('Tenant has been updated', { id: tenantId })

            res.json({ id: tenantId })
        } catch (err) {
            next(err)
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        const validatedQuery = matchedData(req, { onlyValidData: true })
        try {
            const [tenants, count] = await this.tenantService.getAll(
                validatedQuery as TenantQueryParams
            )

            this.logger.info('All tenant have been fetched')
            res.json({
                currentPage: validatedQuery.currentPage as number,
                perPage: validatedQuery.perPage as number,
                total: count,
                data: tenants,
            })
        } catch (err) {
            next(err)
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = validateNumericId(req.params.id)
            const tenant = await this.tenantService.getById(tenantId)

            if (!tenant) {
                next(createHttpError(400, 'Tenant does not exist.'))
                return
            }

            this.logger.info('Tenant has been fetched')
            res.json(tenant)
        } catch (err) {
            next(err)
        }
    }

    async destroy(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = validateNumericId(req.params.id)
            await this.tenantService.deleteById(tenantId)

            this.logger.info('Tenant has been deleted', { id: tenantId })
            res.json({ id: tenantId })
        } catch (err) {
            next(err)
        }
    }
}
