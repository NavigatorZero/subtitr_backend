import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TranslateVideoController } from './controller/translate-video/translate-video.controller';
import { PythonRunnerService } from './services/python-runner.service';
import { VideoService } from './entites/video/video.service';
import { VideoModule } from './entites/video/video.module';

@Module({
  imports: [
    VideoModule
  ],
  controllers: [AppController, TranslateVideoController],
  providers: [AppService, PythonRunnerService],
})
export class AppModule {}
