import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cv } from './entities/cv.entity';
import { User } from '../user/entities/user.entity';
import { Skill } from '../skill/entities/skill.entity';
import { CreateCvDto } from './dtos/create-cv.dto';
import { UpdateCvDto } from './dtos/update-cv.dto';
import { AddSkillsDto } from './dtos/add-skills.dto';

@Injectable()
export class CvService {
  constructor(
    @InjectRepository(Cv)
    private readonly cvRepository: Repository<Cv>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
  ) {}

  async create(createCvDto: CreateCvDto): Promise<Cv> {
    const { userId, ...cvData } = createCvDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const cv = this.cvRepository.create({
      ...cvData,
      user,
    });

    return await this.cvRepository.save(cv);
  }

  async findAll(): Promise<Cv[]> {
    return await this.cvRepository.find({
      relations: ['user', 'skills'],
    });
  }

  async findOne(id: string): Promise<Cv> {
    const cv = await this.cvRepository.findOne({
      where: { id },
      relations: ['user', 'skills'],
    });

    if (!cv) {
      throw new NotFoundException(`CV with ID ${id} not found`);
    }

    return cv;
  }

  async update(id: string, updateCvDto: UpdateCvDto): Promise<Cv> {
    const cv = await this.cvRepository.preload({
      id,
      ...updateCvDto,
    });

    if (!cv) {
      throw new NotFoundException(`CV with ID ${id} not found`);
    }

    return await this.cvRepository.save(cv);
  }

  async remove(id: string): Promise<{ message: string }> {
    const cv = await this.findOne(id);
    
    await this.cvRepository.remove(cv);

    return { message: `CV with ID ${id} has been deleted` };
  }

  async getSkills(id: string): Promise<Skill[]> {
    const cv = await this.findOne(id);
    return cv.skills;
  }

  async addSkills(id: string, addSkillsDto: AddSkillsDto): Promise<Cv> {
    const cv = await this.cvRepository.findOne({
      where: { id },
      relations: ['skills'],
    });

    if (!cv) {
      throw new NotFoundException(`CV with ID ${id} not found`);
    }

    const skills = await this.skillRepository.findByIds(addSkillsDto.skillIds);

    if (skills.length !== addSkillsDto.skillIds.length) {
      throw new BadRequestException('One or more skill IDs are invalid');
    }

    const existingSkillIds = cv.skills.map((s) => s.id);
    const newSkills = skills.filter((s) => !existingSkillIds.includes(s.id));

    cv.skills = [...cv.skills, ...newSkills];

    return await this.cvRepository.save(cv);
  }

  async removeSkill(cvId: string, skillId: string): Promise<Cv> {
    const cv = await this.cvRepository.findOne({
      where: { id: cvId },
      relations: ['skills'],
    });

    if (!cv) {
      throw new NotFoundException(`CV with ID ${cvId} not found`);
    }

    const skillIndex = cv.skills.findIndex((s) => s.id === skillId);

    if (skillIndex === -1) {
      throw new NotFoundException(
        `Skill with ID ${skillId} not found in this CV`,
      );
    }

    cv.skills.splice(skillIndex, 1);

    return await this.cvRepository.save(cv);
  }
}

