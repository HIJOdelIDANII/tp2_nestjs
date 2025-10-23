import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dtos/create-cv.dto';
import { UpdateCvDto } from './dtos/update-cv.dto';
import { AddSkillsDto } from './dtos/add-skills.dto';
import { Cv } from './entities/cv.entity';
import { Skill } from '../skill/entities/skill.entity';

@Controller('cvs')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCvDto: CreateCvDto): Promise<Cv> {
    return await this.cvService.create(createCvDto);
  }

  @Get()
  async findAll(): Promise<Cv[]> {
    return await this.cvService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Cv> {
    return await this.cvService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCvDto: UpdateCvDto,
  ): Promise<Cv> {
    return await this.cvService.update(id, updateCvDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return await this.cvService.remove(id);
  }

  @Get(':id/skills')
  async getSkills(@Param('id') id: string): Promise<Skill[]> {
    return await this.cvService.getSkills(id);
  }

  @Post(':id/skills')
  @HttpCode(HttpStatus.OK)
  async addSkills(
    @Param('id') id: string,
    @Body() addSkillsDto: AddSkillsDto,
  ): Promise<Cv> {
    return await this.cvService.addSkills(id, addSkillsDto);
  }

  @Delete(':id/skills/:skillId')
  @HttpCode(HttpStatus.OK)
  async removeSkill(
    @Param('id') id: string,
    @Param('skillId') skillId: string,
  ): Promise<Cv> {
    return await this.cvService.removeSkill(id, skillId);
  }
}

