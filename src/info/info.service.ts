import { Injectable } from "@nestjs/common";
import { Prisma, project } from "@prisma/client";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class InfoService {
    constructor(private prisma: PrismaService) {}

    async project(
        projectWhereUniqueInput: Prisma.projectWhereUniqueInput) : Promise<project | null> {
            return this.prisma.project.findUnique({
                where: projectWhereUniqueInput
            });
        }
}