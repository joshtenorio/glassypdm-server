import { Controller, Post, Body } from '@nestjs/common';
import { FileMetadataDto } from './ingest.dto';
import { IngestService } from './ingest.service';

@Controller('ingest')
export class IngestController {
    constructor(private readonly ingestService: IngestService) {}

    @Post('metadata')
    async upload(@Body() metadata: FileMetadataDto): Promise<string> {
        return await this.ingestService.createFileRevision(metadata);
    }
}
