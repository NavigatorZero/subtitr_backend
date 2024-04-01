import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'node:fs';
import { extname } from 'node:path';
import { v4 as uuid } from 'uuid';
import { PythonRunnerService } from '../../services/python-runner.service';

export const multerOptions = {
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
    // File modification details
    filename: (req: any, file: any, cb: any) => {
      // Calling the callback passing the random name generated with the original extension name
      cb(null, `${uuid()}${extname(file.originalname)}`);
    },
  }),
};

@Controller('translate-video')
export class TranslateVideoController {
  constructor(private pythonRunnerService: PythonRunnerService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('file', 20, multerOptions))
  uploadMultipleFiles(@UploadedFiles() files) {
    console.log(files);
    const response = [];
    files.forEach((file) => {
      const fileReponse = {
        filename: file.filename,
      };
      setTimeout(() => {
        this.pythonRunnerService.call(
          file.path,
          `/Users/skyeng/projects/subtitr/subtitr_backend/static/with-subs/${file.filename}`,
        );
      }, 5000);
      response.push(fileReponse);
    });
    return response;
  }
}
