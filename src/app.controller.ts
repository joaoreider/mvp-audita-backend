import { Controller, Get } from '@nestjs/common';
import { FilesService } from './files/files.service';

@Controller()
export class AppController {
  constructor(private readonly filesService: FilesService) {}

  @Get('/health')
  async health() {
    const s3 = await this.filesService.checkS3Status();
    return {
      status: 'ok',
      s3,
    };
  }
}
