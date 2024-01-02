import { Module } from '@nestjs/common';
import { CommitController } from './commit.controller';
import { CommitService } from './commit.service';
import { PrismaService } from 'src/prisma.service';
import { ClerkModule } from 'src/clerk/clerk.module';
import { ClerkService } from 'src/clerk/clerk.service';

@Module({
  controllers: [CommitController],
  providers: [CommitService, PrismaService, ClerkService],
  imports: [ClerkModule]
})
export class CommitModule {}
