import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import {
  randFullName,
  randEmail,
  randPassword,
  randNumber,
  randJobTitle,
  randSkill,
  randFilePath,
  randFirstName,
  randLastName,
  seed,
} from '@ngneat/falso';
import { User } from './user/entities/user.entity';
import { Cv } from './cv/entities/cv.entity';
import { Skill } from './skill/entities/skill.entity';

// Set seed for reproducible data (optional)
seed('nestjs-cv-seeder-2025');

async function bootstrap() {
  console.log('🌱 Starting database seeder...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  // Repositories
  const userRepository = dataSource.getRepository(User);
  const cvRepository = dataSource.getRepository(Cv);
  const skillRepository = dataSource.getRepository(Skill);

  try {
    // === Step 1: Create Skills ===
    console.log('📚 Creating skills...');
    const skillNames = [
      'JavaScript',
      'TypeScript',
      'Python',
      'Java',
      'C++',
      'React',
      'Angular',
      'Vue.js',
      'Node.js',
      'NestJS',
      'Express',
      'Django',
      'Spring Boot',
      'Docker',
      'Kubernetes',
      'AWS',
      'Azure',
      'PostgreSQL',
      'MongoDB',
      'MySQL',
      'Git',
      'CI/CD',
      'TDD',
      'Agile',
      'Scrum',
    ];

    const skills: Skill[] = [];
    for (const skillName of skillNames) {
      const skill = skillRepository.create({ designation: skillName });
      const saved = await skillRepository.save(skill);
      skills.push(saved);
    }
    console.log(`✅ Created ${skills.length} skills\n`);

    // === Step 2: Create Users ===
    console.log('👥 Creating users...');
    const users: User[] = [];
    const numberOfUsers = 10;

    for (let i = 0; i < numberOfUsers; i++) {
      const user = userRepository.create({
        username: `user${i + 1}_${randFirstName().toLowerCase()}`,
        email: randEmail(),
        password: randPassword(),
      });
      const savedUser = await userRepository.save(user);
      users.push(savedUser);
    }
    console.log(`✅ Created ${users.length} users\n`);

    // === Step 3: Create CVs with Skills ===
    console.log('📄 Creating CVs...');
    let totalCvsCreated = 0;

    for (const user of users) {
      // Each user gets 1-3 CVs
      const numberOfCvs = randNumber({ min: 1, max: 3 });

      for (let i = 0; i < numberOfCvs; i++) {
        const firstname = randFirstName();
        const lastname = randLastName();

        const cv = cvRepository.create({
          name: lastname,
          firstname: firstname,
          age: randNumber({ min: 22, max: 65 }),
          cin: randNumber({ min: 10000000, max: 99999999 }),
          job: randJobTitle(),
          path: `/uploads/${firstname.toLowerCase()}_${lastname.toLowerCase()}_cv_${Date.now()}.pdf`,
          user: user,
        });

        const savedCv = await cvRepository.save(cv);

        // Add 2-6 random skills to each CV
        const numberOfSkills = randNumber({ min: 2, max: 6 });
        const randomSkills: Skill[] = [];
        const usedIndexes = new Set<number>();

        while (randomSkills.length < numberOfSkills) {
          const randomIndex = randNumber({ min: 0, max: skills.length - 1 });
          if (!usedIndexes.has(randomIndex)) {
            usedIndexes.add(randomIndex);
            randomSkills.push(skills[randomIndex]);
          }
        }

        savedCv.skills = randomSkills;
        await cvRepository.save(savedCv);

        totalCvsCreated++;
      }
    }
    console.log(`✅ Created ${totalCvsCreated} CVs with skills\n`);

    // === Summary ===
    console.log('📊 Database Seeding Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Skills:  ${skills.length}`);
    console.log(`Users:   ${users.length}`);
    console.log(`CVs:     ${totalCvsCreated}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    
    console.log('\n🔍 Sample Data:');
    const sampleUser = users[0];
    const sampleUserWithCvs = await userRepository.findOne({
      where: { id: sampleUser.id },
      relations: ['cvs', 'cvs.skills'],
    });

    if (sampleUserWithCvs) {
      console.log(
        `\nUser: ${sampleUserWithCvs.username} (${sampleUserWithCvs.email})`,
      );
      console.log(`CVs: ${sampleUserWithCvs.cvs.length}`);
      if (sampleUserWithCvs.cvs.length > 0) {
        const sampleCv = sampleUserWithCvs.cvs[0];
        console.log(`  ├─ ${sampleCv.firstname} ${sampleCv.name}`);
        console.log(`  ├─ Job: ${sampleCv.job}`);
        console.log(
          `  └─ Skills: ${sampleCv.skills.map((s) => s.designation).join(', ')}`,
        );
      }
    }

    console.log('\n✨ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
