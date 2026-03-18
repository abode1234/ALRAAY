import { Controller, Get } from '@nestjs/common';
import { FiltersService } from './filters.service';

@Controller('filters')
export class FiltersController {
    constructor(private readonly filtersService: FiltersService) { }

    @Get()
    async getFilters() {
        return this.filtersService.getFilters();
    }
}
