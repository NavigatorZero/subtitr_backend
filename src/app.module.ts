import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TranslateVideoController } from './controller/translate-video/translate-video.controller';
import { PythonRunnerService } from './services/python-runner.service';
import { VideoService } from './entites/video/video.service';
import { VideoModule } from './entites/video/video.module';
import { UsersService } from './services/user.service';
import { AuthController } from './controller/translate-video/auth.contorller';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    VideoModule
  ],
  controllers: [AppController, TranslateVideoController, AuthController],
  providers: [AppService, PythonRunnerService, UsersService, AuthService],
  exports: [UsersService]
})
export class AppModule {}