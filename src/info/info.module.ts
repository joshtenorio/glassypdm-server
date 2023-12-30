import { Module } from '@nestjs/common';
import { InfoController } from './info.controller';
import { InfoService } from './info.service';
import { PrismaService } from 'src/prisma.service';

@Module({
    controllers: [InfoController],
    providers: [InfoService, PrismaService]
})
export class InfoModule {}
