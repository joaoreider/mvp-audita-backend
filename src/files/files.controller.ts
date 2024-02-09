import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Logger } from '@nestjs/common';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  private readonly logger = new Logger('FilesController');
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${file.originalname}`);
        },
      }),
      limits: {
        fileSize: 1024 * 1024 * 10, // limit to 10MB
      },
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype === 'application/vnd.ms-excel' ||
          file.mimetype ===
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Invalid file type'), false);
        }
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    this.logger.verbose(`File uploaded with success: ${file?.originalname}`);
    return 'File uploaded with success!';
  }

  @Get('process')
  async processFile(@Query('filename') filename: string): Promise<string> {
    try {
      this.logger.verbose(
        `Api request to process file: ${JSON.stringify(filename)}`,
      );
      if (!filename) {
        throw new BadRequestException('Filename is required');
      }

      await this.filesService.processFile(filename);
      this.logger.log(`File processed with success`);
      return 'File processed with success!';
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      this.logger.error(`Error: ${err}`);
      throw new InternalServerErrorException('Error processing file');
    }
  }
}