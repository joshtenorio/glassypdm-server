import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfoController } from './info/info.controller';
import { InfoModule } from './info/info.module';
import { InfoService } from './info/info.service';
import { PrismaService } from './prisma.service';
import { CommitModule } from './commit/commit.module';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { FileService } from './file/file.service';
import { FileController } from './file/file.controller';
import { FileModule } from './file/file.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }), InfoModule, CommitModule, UserModule, FileModule],
  controllers: [AppController, InfoController, FileController],
  providers: [AppService, InfoService, PrismaService, FileService],
})
export class AppModule {}
