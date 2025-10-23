import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { CreateSkillDto } from './dtos/create-skill.dto';
import { UpdateSkillDto } from './dtos/update-skill.dto';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {}

  // Create a new skill
  async create(createSkillDto: CreateSkillDto): Promise<Skill> {
    // Check if skill with same designation already exists
    const existing = await this.skillRepository.findOne({
      where: { designation: createSkillDto.designation },
    });

    if (existing) {
      throw new ConflictException(
        `Skill with designation "${createSkillDto.designation}" already exists`,
      );
    }

    const skill = this.skillRepository.create(createSkillDto);
    return await this.skillRepository.save(skill);
  }

  // Get all skills
  async findAll(): Promise<Skill[]> {
    return await this.skillRepository.find();
  }

  // Get one skill by ID
  async findOne(id: string): Promise<Skill> {
    const skill = await this.skillRepository.findOne({
      where: { id },
    });

    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found`);
    }

    return skill;
  }

  // Update a skill
  async update(id: string, updateSkillDto: UpdateSkillDto): Promise<Skill> {
    // Check for duplicate designation if being updated
    if (updateSkillDto.designation) {
      const existing = await this.skillRepository.findOne({
        where: { designation: updateSkillDto.designation },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Skill with designation "${updateSkillDto.designation}" already exists`,
        );
      }
    }

    const skill = await this.skillRepository.preload({
      id,
      ...updateSkillDto,
    });

    if (!skill) {
      throw new NotFoundException(`Skill with ID ${id} not found`);
    }

    return await this.skillRepository.save(skill);
  }

  // Delete a skill
  async remove(id: string): Promise<{ message: string }> {
    const skill = await this.findOne(id); // This will throw if not found

    await this.skillRepository.remove(skill);

    return { message: `Skill "${skill.designation}" has been deleted` };
  }
}

