import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IngestController } from './features/ingest/ingest.controller';
import { S3Module } from 'nestjs-s3';
import { IngestService } from './features/ingest/ingest.service';
import { PrismaService } from './prisma/prisma.service';
import { MinioModule } from '@svtslv/nestjs-minio';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MinioModule.forRootAsync({
      useFactory: () => ({
        config: {
          accessKey: process.env.S3_KEY_ID,
          secretKey: process.env.S3_KEY_SECRET,
          endPoint: process.env.S3_ENDPOINT,
          port: 9000,
          useSSL: false,
        },
      }),
    })],
  controllers: [AppController, IngestController],
  providers: [AppService, IngestService, PrismaService],
})
export class AppModule {}
