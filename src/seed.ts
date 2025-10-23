import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import {
  randFirstName,
  randLastName,
  randEmail,
  randPassword,
  randJobTitle,
  randNumber,
  seed,
} from '@ngneat/falso';
import { User } from './user/entities/user.entity';
import { Cv } from './cv/entities/cv.entity';
import { Skill } from './skill/entities/skill.entity';

// Set seed for reproducible fake data generation
seed('nestjs-cv-seeder-2025');

async function bootstrap() {
  console.log('🌱 Starting database seeder...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const userRepository = dataSource.getRepository(User);
  const cvRepository = dataSource.getRepository(Cv);
  const skillRepository = dataSource.getRepository(Skill);

  try {
    console.log('🧹 Cleaning existing data...');

    // Disable foreign key checks to allow clearing tables with relationships
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await cvRepository.clear();
    await userRepository.clear();
    await skillRepository.clear();
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✅ Database cleaned\n');

    console.log('📚 Creating skills...');

    const skillNames = [
      'JavaScript',
      'TypeScript',
      'Python',
      'Java',
      'C++',
      'C#',
      'React',
      'Angular',
      'Vue.js',
      'Svelte',
      'Node.js',
      'NestJS',
      'Express',
      'Django',
      'Spring Boot',
      'Laravel',
      'Docker',
      'Kubernetes',
      'Jenkins',
      'GitHub Actions',
      'AWS',
      'Azure',
      'Google Cloud',
      'PostgreSQL',
      'MongoDB',
      'MySQL',
      'Redis',
      'Git',
      'CI/CD',
      'TDD',
      'Agile',
      'Scrum',
      'REST APIs',
      'GraphQL',
      'Microservices',
    ];

    const skills: Skill[] = [];
    for (const skillName of skillNames) {
      const saved = await skillRepository.save({ designation: skillName });
      skills.push(saved);
    }
    console.log(`✅ Created ${skills.length} skills\n`);

    console.log('👥 Creating users...');
    const users: User[] = [];
    const numberOfUsers = 25;

    for (let i = 0; i < numberOfUsers; i++) {
      const firstName = randFirstName();
      const email = randEmail();
      const password = randPassword();

      const savedUser = await userRepository.save({
        username: `${firstName.toLowerCase()}_${i + 1}`,
        email: email,
        password: password, // ⚠️ In production: hash with bcrypt
      });

      users.push(savedUser);

      if ((i + 1) % 5 === 0) {
        console.log(`  ├─ Created ${i + 1}/${numberOfUsers} users...`);
      }
    }
    console.log(`✅ Created ${users.length} users\n`);

    console.log('📄 Creating CVs...');
    let totalCvsCreated = 0;

    for (const user of users) {
      const numberOfCvs = randNumber({ min: 1, max: 3 });

      for (let i = 0; i < numberOfCvs; i++) {
        const firstname = randFirstName();
        const lastname = randLastName();
        const jobTitle = randJobTitle();
        const age = randNumber({ min: 22, max: 65 });
        const cin = randNumber({ min: 10000000, max: 99999999 });
        const timestamp = Date.now();
        const cvPath = `/uploads/cvs/${firstname.toLowerCase()}_${lastname.toLowerCase()}_${timestamp}.pdf`;

        const savedCv = await cvRepository.save({
          name: lastname,
          firstname: firstname,
          age: age,
          cin: cin,
          job: jobTitle,
          path: cvPath,
          user: user,
        });

        // Assign 3-8 random skills to CV (Many-to-Many)
        const numberOfSkills = randNumber({ min: 3, max: 8 });
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

    console.log('📊 Database Seeding Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Skills:  ${skills.length}`);
    console.log(`Users:   ${users.length}`);
    console.log(`CVs:     ${totalCvsCreated}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n🔍 Sample Data Preview:');
    const sampleUser = users[0];
    const sampleUserWithCvs = await userRepository.findOne({
      where: { id: sampleUser.id },
      relations: ['cvs', 'cvs.skills'],
    });

    if (sampleUserWithCvs && sampleUserWithCvs.cvs.length > 0) {
      console.log(
        `\nUser: ${sampleUserWithCvs.username} (${sampleUserWithCvs.email})`,
      );
      console.log(`CVs: ${sampleUserWithCvs.cvs.length}`);

      sampleUserWithCvs.cvs.forEach((cv, index) => {
        const prefix = index === sampleUserWithCvs.cvs.length - 1 ? '└─' : '├─';
        console.log(`  ${prefix} ${cv.firstname} ${cv.name} - ${cv.job}`);
        console.log(`     Age: ${cv.age} | CIN: ${cv.cin}`);
        console.log(
          `     Skills: ${cv.skills.map((s) => s.designation).join(', ')}`,
        );
      });
    }

    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('\n !!!! Error during seeding:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
