import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TranslateVideoController } from './controller/translate-video/translate-video.controller';
import { PythonRunnerService } from './services/python-runner.service';
import { VideoModule } from './entites/video/video.module';
import { AuthController } from './controller/translate-video/auth.contorller';
import { AuthService } from './services/auth.service';
import { UserModule } from './entites/user/user.module';

@Module({
  imports: [
    VideoModule,
    UserModule,
  ],
  controllers: [AppController, TranslateVideoController, AuthController],
  providers: [AppService, PythonRunnerService, AuthService],
  exports: []
})
export class AppModule {}