import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { PrismaService } from 'src/prisma.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
const multerS3 = require("multer-s3");
import { S3Client } from '@aws-sdk/client-s3';

@Module({
    imports: [MulterModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
            storage: multerS3({
                s3: new S3Client({
                    region: configService.get<string>("S3_REGION"),
                    credentials: {
                        secretAccessKey: configService.get<string>("S3_SECRET_ACCESS_KEY"),
                        accessKeyId: configService.get<string>("S3_ACCESS_KEY_ID")
                    }
                }),
                bucket: configService.get<string>("S3_BUCKET_NAME"),
                acl: "public-read",
                metadata: function(req: any, file: any, cb: any) {
                    cb(null, { fieldName: file.fieldname })
                },
                key: function(req: any, file: any, cb: any) {
                    cb(null, Date.now().toString());
                }
            })
        }),
        inject: [ConfigService]
    })],
    controllers: [FileController],
    providers: [FileService, PrismaService]
})
export class FileModule {}
