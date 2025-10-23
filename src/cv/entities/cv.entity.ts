import { TimestampAbstract } from 'src/common/timestamp';
import { Skill } from 'src/skill/entities/skill.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()     
export class Cv extends TimestampAbstract {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column()
  firstname: string;
  @Column()
  age: number;
  @Column({ unique: true })
  cin: number;
  @Column()
  job: string;
  @Column()
  path: string;
  @ManyToOne(() => User, (u) => u.cvs)
  user: User;
  @ManyToMany(() => Skill)
  @JoinTable()
  skills: Skill[]
}
