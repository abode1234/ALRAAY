import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { CreateSectionDto, UpdateSectionDto } from './dto/create-section.dto';

@Controller('sections')
export class SectionsController {
    constructor(private readonly sectionsService: SectionsService) { }

    @Post()
    create(@Body() createSectionDto: CreateSectionDto) {
        return this.sectionsService.create(createSectionDto);
    }

    @Get()
    findAll() {
        return this.sectionsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.sectionsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto) {
        return this.sectionsService.update(id, updateSectionDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.sectionsService.remove(id);
    }
}
