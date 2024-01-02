import { Injectable } from "@nestjs/common";
import { commit as Commit } from "@prisma/client";
import { PrismaService } from "src/prisma.service";


@Injectable()
export class CommitService {
    constructor(private prisma: PrismaService) {}

    async recent(projectId: number): Promise<Commit[] | null> {
        return this.commits(projectId, 0, 5);
    }

    async commits(projectId: number, skip: number, take: number): Promise<Commit[] | null> {
        return this.prisma.commit.findMany({
            where: {
                projectid: {
                    equals: projectId
                }
            },
            orderBy: {
                id: "desc"
            },
            skip: skip,
            take: take
        });
    }

    async info(commitId: number): Promise<Commit | null> {
        return this.prisma.commit.findFirst({
            where: {
                id: {
                    equals: commitId
                }
            }
        })
    }

    insert(id: number, projectid: number, authorid: string, message: string, filecount: number, timestamp: string) {
        this.prisma.commit.create({
            data: {
                id: id,
                projectid: projectid,
                authorid: authorid,
                message: message,
                filecount: filecount,
                timestamp: timestamp
            }
        })
    }

}