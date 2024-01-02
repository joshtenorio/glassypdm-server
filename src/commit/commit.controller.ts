import { Controller, Get, Logger, Query } from '@nestjs/common';
import { CommitService } from './commit.service';
import { commit as Commit } from '@prisma/client';
import { ClerkService } from 'src/clerk/clerk.service';
import { User } from '@clerk/clerk-sdk-node';
@Controller('commit')
export class CommitController {
    constructor(
        private readonly commitService: CommitService,
        private readonly clerkService: ClerkService
    ) {}

    @Get("")
    getInfo(): string {
        return "asdf";
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

}
