import { Module } from '@nestjs/common';
import { CommitController } from './commit.controller';
import { CommitService } from './commit.service';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { FileModule } from 'src/file/file.module';
import { FileService } from 'src/file/file.service';

@Module({
  controllers: [CommitController],
  providers: [CommitService, PrismaService, UserService, FileService],
  imports: [UserModule, FileModule]
})
export class CommitModule {}
