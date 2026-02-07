import { AppDataSource } from '../config/data-source.js'
import { Tenant } from '../entity/Tenant.js'
import type { TenantData } from '../types/index.js'

export class TenantService {
    constructor(
        private tenantRepository = AppDataSource.getRepository(Tenant)
    ) {}

    async createTenant(tenantData: TenantData) {
        return await this.tenantRepository.save({
            name: tenantData.name,
            address: tenantData.address,
        })
    }
}
