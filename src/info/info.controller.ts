import { Controller, Get } from '@nestjs/common';

@Controller('info')
export class InfoController {
    // TODO service
    
    @Get()
    getInfo(): string {
        return "asdf";
    }

}
