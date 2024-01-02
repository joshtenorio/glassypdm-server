import { Body, Controller, Get, Logger, Param, Post, Query } from '@nestjs/common';
import { CommitService } from './commit.service';
import { commit as Commit, file as File } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { User } from '@clerk/clerk-sdk-node';
import { FileService } from 'src/file/file.service';

@Controller('commit')
export class CommitController {
    constructor(
        private readonly commitService: CommitService,
        private readonly clerkService: UserService,
        private readonly fileService: FileService
    ) {}

    @Get("")
    async getCommits(@Query() query: any) {
        let commits: Commit[] = await this.commitService.commits(parseInt(query.project), parseInt(query.skip), parseInt(query.take));
        for(let i = 0; i < commits.length; i++) {
            let user: User = await this.clerkService.userById(commits[i].authorid);
            commits[i].authorid = user.firstName + " " + user.lastName;
        }
        return commits;
    }

    @Get("recent")
    async getRecent(@Query() query: any) {
        Logger.log('hehe', 'CommitController');
        const projectid: number = parseInt(query.project);
        let commits: Commit[] = await this.commitService.recent(projectid);
        for(let i = 0; i < commits.length; i++) {
            let user: User = await this.clerkService.userById(commits[i].authorid);
            commits[i].authorid = user.firstName + " " + user.lastName;
        }
        return commits;
    }

    @Post("")
    async tryCommit(@Body() body: any) {
        // check if commit exists
        const commit = await this.commitService.info(body.commitid);
        if(commit) {
            return { "isCommitFree": false };
        }

        // create commit
        let message: string = body.message;
        message = message.substring(0, 500);
        const timestamp = Date.now().toString();
        this.commitService.insert(
            body.commitid,
            body.projectid,
            body.authorid,
            message,
            body.fileCount,
            timestamp
        );

        return { "isCommitFree": true };
    }

    @Get(":id")
    async getCommitInfo(@Param() params: any) {
        const id: number = parseInt(params.id);

        // commit info
        const commit = await this.commitService.info(id);
        const user: User = await this.clerkService.userById(commit.authorid);

        // files
        let files: File[] = await this.fileService.commit(id);

        return {
            author: user.firstName + " " + user.lastName,
            id: commit.id,
            message: commit.message,
            timestamp: commit.timestamp,
            count: files.length,
            files: files
        };
    }

}
