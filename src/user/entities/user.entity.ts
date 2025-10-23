import { TimestampAbstract } from 'src/common/timestamp';
import { Cv } from 'src/cv/entities/cv.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User extends TimestampAbstract {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  username: string;
  @Column({ unique: true })
  email: string;
  @Column()
  password: string;
  @OneToMany(() => Cv, (cv) => cv.user)
  cvs: Cv[];
}
