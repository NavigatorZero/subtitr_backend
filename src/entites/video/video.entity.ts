import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
