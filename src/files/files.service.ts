import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class FilesService {
  async processFile(filename: string): Promise<void> {
    const config = {
      string: '',
      method: 'GET',
      url: `${process.env.PROCESSOR_BASE_URL}?filename=${filename}`,
    };

    await axios.request(config);
    return;
  }
}
