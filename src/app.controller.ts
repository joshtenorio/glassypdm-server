import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // TODO type the thing lol
  @Get("version")
  getVersion(): any {
    return { "version": "0.4.0" };
  }
}
