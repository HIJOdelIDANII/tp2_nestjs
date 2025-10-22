import { TimestampAbstract } from 'src/common/timestamp';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Skill extends TimestampAbstract {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ unique: true })
  designation: string;
}
