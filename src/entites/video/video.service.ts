import { Inject, Injectable } from "@nestjs/common";

import { VideoEntity } from './video.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VideoService {
  constructor(
    @Inject('VIDEO_REPOSITORY')
    private readonly usersRepository: Repository<VideoEntity>,
  ) {}
  async insert(entity: VideoEntity): Promise<VideoEntity> {
    entity = this.usersRepository.create(entity);
    await this.usersRepository.save(entity);
    return entity;
  }

  findAll(): Promise<VideoEntity[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<VideoEntity | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}