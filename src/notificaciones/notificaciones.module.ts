// src/notificaciones/notificaciones.module.ts
import { Module } from '@nestjs/common';
import { TurnosModule } from '../turnos/turnos.module';
import { NotificacionesController } from './notificaciones.controller';
import { GenerarRecordatoriosUseCase } from './application/generar-recordatorios.use-case';
import { ListarNotificacionesUseCase } from './application/listar-notificaciones.use-case';
import { EnviarNotificacionUseCase } from './application/enviar-notificacion.use-case';
import { GenerarSeguimientoService } from './application/generar-seguimiento.service';
import { PrismaNotificacionRepository } from './infrastructure/prisma-notificacion.repository';
import { PrismaDatosNotificacionRepository } from './infrastructure/prisma-datos-notificacion.repository';
import { WhatsAppEnlaceAdapter } from './infrastructure/whatsapp-enlace.adapter';
import { RelojRecordatoriosService } from './infrastructure/reloj-recordatorios.service';

@Module({
  imports: [TurnosModule],
  controllers: [NotificacionesController],
  providers: [
    GenerarRecordatoriosUseCase,
    ListarNotificacionesUseCase,
    EnviarNotificacionUseCase,
    GenerarSeguimientoService,
    RelojRecordatoriosService,
    {
      provide: 'INotificacionRepository',
      useClass: PrismaNotificacionRepository,
    },
    {
      provide: 'IDatosNotificacionRepository',
      useClass: PrismaDatosNotificacionRepository,
    },
    { provide: 'IMensajePort', useClass: WhatsAppEnlaceAdapter },
  ],
  // El cierre del turno (módulo cobros) genera el seguimiento
  exports: [GenerarSeguimientoService],
})
export class NotificacionesModule {}
