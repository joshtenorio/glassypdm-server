import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfoController } from './info/info.controller';
import { InfoModule } from './info/info.module';
import { InfoService } from './info/info.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }), InfoModule],
  controllers: [AppController, InfoController],
  providers: [AppService, InfoService, PrismaService],
})
export class AppModule {}
