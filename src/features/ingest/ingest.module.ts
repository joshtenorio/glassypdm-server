import { Module } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { IngestController } from './ingest.controller'
import { IngestService } from './ingest.service'

@Module({
  providers: [IngestService, PrismaService],
  exports: [IngestController]
})
export class PrismaModule {}