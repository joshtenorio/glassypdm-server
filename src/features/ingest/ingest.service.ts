import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileMetadataDto } from './ingest.dto';

@Injectable()
export class IngestService {
    constructor(private prisma: PrismaService) {}

    async createFileRevision(metadata: FileMetadataDto): Promise<string> {
        await this.prisma.file.create({
            data: {
                path: metadata.path,
                revision: metadata.revision,
                commitId: metadata.commit,
                hash: metadata.hash,
                size: metadata.size
            },
        });
        return "kang + uwu = kanguwu !"
    }
}