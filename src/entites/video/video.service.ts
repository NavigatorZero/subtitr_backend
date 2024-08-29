import { Inject, Injectable } from "@nestjs/common";

import { VideoEntity } from './video.entity';
import { Repository } from 'typeorm';
import { UserService } from "../user/user.service";
import * as fs from "node:fs";

@Injectable()
export class VideoService {
  constructor(
    @Inject('VIDEO_REPOSITORY')
    private readonly videoRepository: Repository<VideoEntity>,
    private readonly userService: UserService,
  ) {}
  
  async insert(entity: VideoEntity): Promise<VideoEntity> {
    console.log(entity);
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
    const entity = await this.videoRepository.findOneBy({id: id});
    try {
      await fs.unlink(
          `/var/www/subtitr/subtitr_backend/static/with-subs${entity.uuid}.mp4`,
          () => console.log('removed'));
    } catch (err) {
      console.error(err);
    }
    await this.videoRepository.delete(entity.id);
  }
}