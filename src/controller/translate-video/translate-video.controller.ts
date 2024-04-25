import {
  Controller, createParamDecorator, Get, Header,
  HttpException,
  HttpStatus, Param,
  Post, Res, StreamableFile,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage} from "multer";
import { createReadStream, existsSync, mkdirSync } from 'node:fs';
import { v4 as uuidv4, v6 as uuidv6 } from 'uuid';
import { v4 as uuid } from 'uuid';
import { PythonRunnerService } from '../../services/python-runner.service';
import type { Response } from 'express';
import * as fs from 'fs';
import { VideoService } from "../../entites/video/video.service";
import { VideoEntity } from "../../entites/video/video.entity";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";

export const multerOptions: MulterOptions = {
  // Enable file size limits
  limits: {
    fileSize: 3000000000000000,
  },
  // Check the mimetypes to allow for upload
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(mp4|jpeg|png|gif)$/)) {
      // Allow storage of file
      cb(null, true);
    } else {
      // Reject file
      cb(
        new HttpException(
          `Unsupported file type ${file.originalname}`,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
  },
  // Storage properties
  storage: diskStorage({
    // Destination storage path details
    destination: (req: any, file: any, cb: any) => {
      const uploadPath = process.cwd() + '/static/videos';
      console.log(process.cwd() + '/static/videos');
      // Create folder if doesn't exist
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath);
      }
      cb(null, uploadPath);
    },
  }),
};

@Controller('translate-video')
export class TranslateVideoController {
  constructor(
    private pythonRunnerService: PythonRunnerService,
    private videoService: VideoService,
  ) {}
  @Post('upload')
  @UseInterceptors(FilesInterceptor('file', 20, multerOptions))
  async uploadMultipleFiles(
    @UploadedFiles() files,
  ): Promise<Array<VideoEntity>> {
    const response = [];
    for (const file of files) {
      console.log(file);
      const videoEntity = await this.videoService.insert({
        name: file.filename,
        path: file.path,
        path_new: `${process.cwd()}/static/with-subs/${file.filename}`,
        uuid: uuidv4(),
      });

      this.pythonRunnerService.call(videoEntity.path, videoEntity.path_new);
      response.push(videoEntity);
    }
    return response;
  }

  @Get(':id')
  getFile(
    @Param() params: any,
    @Res({ passthrough: true }) res: Response,
  ): StreamableFile {
    const file = createReadStream(
      `${process.cwd()}/static/with-subs/${params.id}.mp4`,
    );
    res.set({
      'Content-Type': 'video/mp4',
      'Content-Disposition': 'attachment; filename="package.mp4"',
    });
    return new StreamableFile(file);
  }

  @Get('list/all')
  async getFileList(): Promise<VideoEntity[]> {
    return await this.videoService.findAll();
  }
}
