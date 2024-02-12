import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class FilesService {
  private readonly logger = new Logger('FilesService');
  async processFile(filename: string): Promise<void> {
    const config = {
      string: '',
      method: 'GET',
      url: `${process.env.PROCESSOR_BASE_URL}?filename=${filename}`,
    };

    await axios.request(config);
    return;
  }

  async clearUploads() {
    const pastaUploads = join(__dirname, '..', '..', 'uploads');

    fs.readdir(pastaUploads, (err, arquivos) => {
      if (err) {
        console.error(`Erro ao ler a pasta de uploads: ${err}`);
        return;
      }

      this.logger.log('Removendo propostas da pasta de uploads');
      arquivos.forEach((arquivo) => {
        if (arquivo !== '.gitkeep') {
          fs.unlink(join(pastaUploads, arquivo), (err) => {
            if (err) {
              console.error(`Erro ao remover o arquivo ${arquivo}: ${err}`);
              return;
            }
          });
        }
      });
    });
  }
}
