import { Injectable } from "@nestjs/common";
import { commit as Commit } from "@prisma/client";
import { PrismaService } from "src/prisma.service";


@Injectable()
export class CommitService {
    constructor(private prisma: PrismaService) {}
    async recent(projectId: number): Promise<Commit[] | null> {
        return this.prisma.commit.findMany({
            where: {
                projectid: {
                    equals: projectId
                }
            },
            orderBy: {
                id: "desc"
            },
            skip: 0,
            take: 5
        });

    }

}