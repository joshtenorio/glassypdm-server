import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfoController } from './info/info.controller';
import { InfoModule } from './info/info.module';
import { InfoService } from './info/info.service';
import { PrismaService } from './prisma.service';
import { CommitModule } from './commit/commit.module';
import { ClerkService } from './clerk/clerk.service';
import { ClerkModule } from './clerk/clerk.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }), InfoModule, CommitModule, ClerkModule],
  controllers: [AppController, InfoController],
  providers: [AppService, InfoService, PrismaService],
})
export class AppModule {}
