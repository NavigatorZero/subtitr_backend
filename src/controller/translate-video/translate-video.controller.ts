import {
  Controller, createParamDecorator, Get, Header,
  HttpException,
  HttpStatus, Param,
  Post, Res, StreamableFile,
  UploadedFile,
  UploadedFiles,
  UseInterceptors
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { createReadStream, existsSync, mkdirSync } from "node:fs";
import { extname, join } from "node:path";
import { v4 as uuid } from "uuid";
import { PythonRunnerService } from "../../services/python-runner.service";
import type { Response } from "express";

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
          `/root/subtitr/subtitr_backend/static/with-subs/${file.filename}`,
        );
      }, 5000);
      response.push(fileReponse);
    });
    return response;
  }

  @Get(':id')
  getFile(@Param() params: any,@Res({ passthrough: true }) res: Response): StreamableFile {
    const file = createReadStream(
      `/root/subtitr/subtitr_backend/static/with-subs/${params.id}.mp4`,
    );
    res.set({
      'Content-Type': 'video/mp4',
      'Content-Disposition': 'attachment; filename="package.mp4"',
    });
    return new StreamableFile(file);
  }
}
