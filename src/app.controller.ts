import { Controller, Get, HttpCode } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('healthz')
  @HttpCode(200)
  healthCheck(): { status: string } {
    return { status: 'ok' };
  }
}
