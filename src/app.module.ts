import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TranslateVideoController } from './controller/translate-video/translate-video.controller';
import { PythonRunnerService } from './services/python-runner.service';

@Module({
  imports: [],
  controllers: [AppController, TranslateVideoController],
  providers: [AppService, PythonRunnerService],
})
export class AppModule {}
