import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { join } from 'path';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class FilesService {
  private readonly PROCESSOR_BASE_URL: string;
  private readonly AWS_S3_BUCKET: string;
  private s3: AWS.S3;
  constructor(private configService: ConfigService) {
    this.PROCESSOR_BASE_URL =
      this.configService.get<string>('PROCESSOR_BASE_URL');
    this.AWS_S3_BUCKET = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get<string>('AWS_S3_ACCESS_KEY'),
      secretAccessKey: this.configService.get<string>('AWS_S3_SECRET_KEY'),
      endpoint:
        this.configService.get<string>('NODE_ENV') === 'development'
          ? this.configService.get<string>('S3_ENDPOINT')
          : undefined,
    });
  }

  async uploadFile(file: Express.Multer.File, analysisCode: string) {
    const { originalname } = file;
    console.log('S3 endpoint:', this.configService.get<string>('S3_ENDPOINT'));
    return await this.s3_upload(
      file.buffer,
      this.AWS_S3_BUCKET,
      originalname,
      file.mimetype,
      analysisCode,
    );
  }
  private readonly logger = new Logger('FilesService');

  private async s3_upload(file, bucket, name, mimetype, analysisCode: string) {
    const path = `${analysisCode}/${String(name)}`;
    console.log('Uploading file to S3:', path);
    const params = {
      Bucket: bucket,
      Key: path,
      Body: file,
      ContentType: mimetype,
      ContentDisposition: 'inline',
    };

    try {
      await this.s3.upload(params).promise();
      return 'File uploaded!';
    } catch (e) {
      this.logger.error(`Error uploading file to S3: ${e}`);
      throw e;
    }
  }

  async checkS3Status() {
    return await this.s3.listBuckets().promise();
  }

  async processFile(analysisCode: string): Promise<void> {
    const config = {
      string: '',
      method: 'GET',
      url: `${this.PROCESSOR_BASE_URL}?folder_id=${analysisCode}`,
    };

    try {
      const result = await axios.request(config);
      return result.data;
    } catch (e) {
      this.logger.error(`Error processing file: ${e}`);
      throw e;
    }
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
