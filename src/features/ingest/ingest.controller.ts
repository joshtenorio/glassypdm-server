import { Controller, Post, Get, Body } from '@nestjs/common';
import { FileMetadataDto } from './ingest.dto';
import { IngestService } from './ingest.service';
import { InjectS3, S3 } from 'nestjs-s3';
import { InjectMinioClient, MinioClient } from '@svtslv/nestjs-minio';

@Controller('ingest')
export class IngestController {
    constructor(
        private readonly ingestService: IngestService,
        @InjectMinioClient() private readonly s3: MinioClient
        ) {}

    @Post('metadata')
    async upload(@Body() metadata: FileMetadataDto): Promise<string> {
        return await this.ingestService.createFileRevision(metadata);
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
