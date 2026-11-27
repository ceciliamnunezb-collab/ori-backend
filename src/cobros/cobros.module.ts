// src/cobros/cobros.module.ts
import { Module } from '@nestjs/common';
import { TurnosModule } from '../turnos/turnos.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { CobrosController } from './cobros.controller';
import {
  RegistrarCobroUseCase,
  VALIDADOR_COBRO,
} from './application/registrar-cobro.use-case';
import { ConsultarCobrosUseCase } from './application/consultar-cobros.use-case';
import { PrismaCobroRepository } from './infrastructure/prisma-cobro.repository';
import { ValidadorCierre } from '../turnos/domain/cierre/validador-cierre';
import { ReglaTurnoConfirmado } from '../turnos/domain/cierre/regla-turno-confirmado';
import { ReglaHorarioAlcanzado } from '../turnos/domain/cierre/regla-horario-alcanzado';
import { ReglaImportePositivo } from '../turnos/domain/cierre/regla-importe-positivo';
import { ReglaMedioPagoAdmitido } from '../turnos/domain/cierre/regla-medio-pago-admitido';
import { ReglaTransferenciaVerificada } from '../turnos/domain/cierre/regla-transferencia-verificada';

@Module({
  imports: [TurnosModule, NotificacionesModule],
  controllers: [CobrosController],
  providers: [
    RegistrarCobroUseCase,
    ConsultarCobrosUseCase,
    { provide: 'ICobroRepository', useClass: PrismaCobroRepository },
    // Patrón Strategy: las reglas que se validan al registrar un cobro
    {
      provide: VALIDADOR_COBRO,
      useFactory: () =>
        new ValidadorCierre([
          new ReglaTurnoConfirmado(), // RN-26
          new ReglaHorarioAlcanzado(), // RN-26
          new ReglaImportePositivo(), // RN-29
          new ReglaMedioPagoAdmitido(), // RN-27
          new ReglaTransferenciaVerificada(),
        ]),
    },
  ],
})
export class CobrosModule {}
