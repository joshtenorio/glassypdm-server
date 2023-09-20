import { Controller, Post, Get, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileMetadataDto } from './ingest.dto';
import { IngestService } from './ingest.service';
import { InjectS3, S3 } from 'nestjs-s3';
import { InjectMinioClient, MinioClient } from '@svtslv/nestjs-minio';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('ingest')
export class IngestController {
    constructor(
        private readonly ingestService: IngestService,
        @InjectMinioClient() private readonly s3: MinioClient
        ) {}

    @UseInterceptors(FileInterceptor('file'))
    @Post('upload')
    async upload(
        @Body() metadata: FileMetadataDto,
        @UploadedFile() file: Express.Multer.File): Promise<string> {
        return await this.ingestService.createFileRevision(metadata);
        // TODO upload to s3
    }

    @Get('test-s3')
    async listBuckets() {
        try {
            const list = await this.s3.listBuckets();
            console.log(list);
        } catch(e) {
            console.log(e);
        }
        return "hehe";
    }
}
