import { Module } from '@nestjs/common';
import { VideoEntity } from './video.entity';
import { DatabaseModule } from '../../database/database.module';
import { DataSource } from 'typeorm';
import { VideoService } from './video.service';
import { UserModule } from '../user/user.module';
@Module({
  imports: [DatabaseModule, UserModule],
  providers: [
    {
      provide: 'VIDEO_REPOSITORY',
      useFactory: (dataSource: DataSource) =>
        dataSource.getRepository(VideoEntity),
      inject: ['DATA_SOURCE'],
    },
    VideoService,
  ],
  exports: [VideoService],
})
export class VideoModule {}
