// src/app.controller.ts
import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { LocalCacheService } from './cache/local-cache.service';

@Controller()
export class AppController {
  constructor(private readonly cache: LocalCacheService) {}

  @Get('test-cache-set')
  testSet() {
    this.cache.set('foo', 'bar');
    return { ok: true };
  }

  @Get('test-cache-get')
  testGet() {
    const foo = this.cache.get<string>('foo');
    return { foo: foo ?? null };
  }
  
  /**
   * Endpoint de Health Check para servicios de monitoreo como UptimeRobot.
   * Responde con un status 200 OK para indicar que el servicio está activo.
   * Es liviano y no realiza operaciones complejas.
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  healthCheck(): object {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
