import { Controller, Get } from '@nestjs/common';
import { InfoService } from './info.service';

@Controller('info')
export class InfoController {
    // TODO service + constructor
    constructor(
        private readonly infoService: InfoService
    ) {}

    @Get()
    getInfo(): string {
        return "asdf";
    }

    @Get("version")
    getVersion(): any {
        return { version: "v0.4.0" };
    }



}
