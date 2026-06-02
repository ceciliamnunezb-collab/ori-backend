import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TurnosModule } from './turnos/turnos.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TurnosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
