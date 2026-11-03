import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TurnosModule } from './turnos/turnos.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { CobrosModule } from './cobros/cobros.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    TurnosModule,
    // Iteración 2: cierre del ciclo del turno
    NotificacionesModule,
    CobrosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
