import { Injectable } from '@nestjs/common';
import { file as File } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FileService {
    constructor(private prisma: PrismaService) {}

    async commit(commitid: number): Promise<File[] | null> {
        return this.prisma.file.findMany({
            where: {
                commitid: {
                    equals: commitid
                }
            }
        });
    }
}
