import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { createReadStream, existsSync, mkdirSync } from 'node:fs';
import { v4 as uuidv4 } from 'uuid';
import { PythonRunnerService } from '../../services/python-runner.service';
import type { Response } from 'express';
import { VideoService } from '../../entites/video/video.service';
import { VideoEntity } from '../../entites/video/video.entity';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { UserService } from 'src/entites/user/user.service';
import {QueueService} from "../../services/queue2.service";

export const multerOptions: MulterOptions = {
  // Enable file size limits
  limits: {
    fileSize: 3000000000000000,
  },
  // Check the mimetypes to allow for upload
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(mp4|quicktime|mov)$/)) {
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
    private videoService: VideoService,
    private userService: UserService,
    private readonly queueService: QueueService,
  ) {}
  @Post('upload')
  @UseInterceptors(FilesInterceptor('file', 20, multerOptions))
  async uploadMultipleFiles(
    @UploadedFiles() files,
    @Body() body,
  ): Promise<Array<VideoEntity>> {
    console.log(files, body);
    const response = [];
    for (const file of files) {
      const videoEntity1 = {
        name: file.originalname,
        path: file.path,
        path_new: `${process.cwd()}/static/with-subs/${file.filename}.mp4`,
        uuid: uuidv4(),
        user: await this.userService.findOne(body.userId),
      };

      await this.queueService.addJob({
        inputFile: videoEntity1.path,
        outputFile: videoEntity1.path_new,
        speed: body.speed,
        position: body.position,
        font: body.font,
        entity: videoEntity1,
      });

      response.push(videoEntity1);
    }

    return response;
  }

  @Get(':id')
  async getFile(
    @Param() params: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const video = await this.videoService.findOne(params.id);
    const file = createReadStream(`${video.path_new}`);
    res.set({
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename="${video.name}"`,
    });
    return new StreamableFile(file);
  }

  @Get('list/:userId/all')
  async getFileList(
    @Param('userId', new ParseIntPipe()) userId,
  ): Promise<VideoEntity[]> {
    return await this.videoService.findByUserId(userId);
  }
}
