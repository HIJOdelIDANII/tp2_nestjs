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
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dtos/create-skill.dto';
import { UpdateSkillDto } from './dtos/update-skill.dto';
import { Skill } from './entities/skill.entity';

@Controller('skills')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  // POST /skills - Create a new skill
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSkillDto: CreateSkillDto): Promise<Skill> {
    return await this.skillService.create(createSkillDto);
  }

  // GET /skills - Get all skills
  @Get()
  async findAll(): Promise<Skill[]> {
    return await this.skillService.findAll();
  }

  // GET /skills/:id - Get one skill by ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Skill> {
    return await this.skillService.findOne(id);
  }

  // PATCH /skills/:id - Update a skill
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
  ): Promise<Skill> {
    return await this.skillService.update(id, updateSkillDto);
  }

  // DELETE /skills/:id - Delete a skill
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return await this.skillService.remove(id);
  }
}

