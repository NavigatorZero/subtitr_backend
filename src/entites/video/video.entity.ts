import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../user/user.entity';

@Entity({})
export class VideoEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  path: string;

  @Column({ type: 'varchar' })
  path_new: string;

  @Column({ type: 'varchar' })
  uuid: boolean;

  @ManyToOne(() => UserEntity, (user) => user.videos, {nullable: false})
  user: UserEntity
}
