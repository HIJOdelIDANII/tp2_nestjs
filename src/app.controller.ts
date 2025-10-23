import { Controller, Get, Version } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('hello')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('first')
  @Version('1')
  getHelloV1(): string {
    return this.appService.getHello();
  }

  @Get('first')
  @Version('2')
  getHelloV2(): string {
    return this.appService.getHello() + ' - Version 2';
  }
}
