import { Inject, Injectable } from "@nestjs/common";

import { VideoEntity } from './video.entity';
import { Repository } from 'typeorm';
import { UserService } from "../user/user.service";

@Injectable()
export class VideoService {
  constructor(
    @Inject('VIDEO_REPOSITORY')
    private readonly videoRepository: Repository<VideoEntity>,
    private readonly userService: UserService,
  ) {}
  
  async insert(entity: VideoEntity): Promise<VideoEntity> {
    entity = this.videoRepository.create(entity);
    await this.videoRepository.save(entity);
    return entity;
  }

  findAll(): Promise<VideoEntity[]> {
    return this.videoRepository.find();
  }

  async findByUserId(userId: number): Promise<VideoEntity[]> {
    return this.videoRepository.find({
      where:{
        user: await  this.userService.findOne(userId)
      }
    })
  }

  findOne(id: number): Promise<VideoEntity | null> {
    return this.videoRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.videoRepository.delete(id);
  }
}