import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { VideoEntity } from '../video/video.entity';

@Entity({})
export class UserEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @OneToMany(() => VideoEntity, (video) => video.user)
  videos: VideoEntity[]
  
}
