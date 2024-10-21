import {
    Controller,
    Get,
    Param,
    Res,
    StreamableFile,
} from '@nestjs/common';
import { createReadStream } from 'node:fs';
import type { Response } from 'express';

@Controller('translate-video')
export class ClipsAiVideoController {

    @Get('clip/:id')
    async getClipFile(
        @Param() params: any,
        @Res({ passthrough: true }) res: Response,
    ): Promise<StreamableFile> {
        const file = createReadStream(`${process.cwd()}/src/generation/clip${params.id}.mp4`);
        res.set({
            'Content-Type': 'video/mp4',
            'Content-Disposition': `attachment; filename="clip${params.id}"`,
        });
        return new StreamableFile(file);
    }
}
