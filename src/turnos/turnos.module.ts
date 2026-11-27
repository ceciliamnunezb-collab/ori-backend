// src/turnos/turnos.module.ts
import { Module } from '@nestjs/common';

import { CrearTurnoUseCase } from './application/crear-turno.use-case';
import {
  CancelarTurnoUseCase,
  ConfirmarTurnoUseCase,
  RechazarTurnoUseCase,
  RegistrarInasistenciaUseCase,
  VALIDADOR_INASISTENCIA,
} from './application/transiciones-turno.use-case';
import { ValidadorTurno } from './domain/validaciones/validador-turno';

import { PrismaTurnoRepository } from './infrastructure/prisma-turno.repository';
import { PrismaDisponibilidadRepository } from './infrastructure/prisma-disponibilidad.repository';
import { PrismaServicioRepository } from './infrastructure/prisma-servicio.repository';

import { TurnosController } from './turnos.controller';
import { ReglaFechaNoPasada } from './domain/validaciones/regla-fecha-no-pasada';
import { ReglaVentanaReserva } from './domain/validaciones/regla-ventana-reserva';
import { ReglaSuperposicion } from './domain/validaciones/regla-superposicion';
import { ITurnoRepository } from './domain/puertos/turno-repository.port';
import { ReglaDisponibilidad } from './domain/validaciones/regla-disponibilidad';
import { IDisponibilidadRepository } from './domain/puertos/disponibilidad-repository.port';
import { ValidadorCierre } from './domain/cierre/validador-cierre';
import { ReglaTurnoConfirmado } from './domain/cierre/regla-turno-confirmado';
import { ReglaHorarioAlcanzado } from './domain/cierre/regla-horario-alcanzado';

@Module({
  controllers: [TurnosController],
  providers: [
    {
      provide: ValidadorTurno,
      useFactory: (
        repoTurno: ITurnoRepository,
        repoDisponibilidad: IDisponibilidadRepository,
      ) => {
        return new ValidadorTurno([
          new ReglaFechaNoPasada(),
          new ReglaVentanaReserva(30),
          new ReglaSuperposicion(repoTurno, 2),
          new ReglaDisponibilidad(repoDisponibilidad),
        ]);
      },
      inject: ['ITurnoRepository', 'IDisponibilidadRepository'],
    },
    // Iteración 2: reglas para registrar la inasistencia (RN-26)
    {
      provide: VALIDADOR_INASISTENCIA,
      useFactory: () =>
        new ValidadorCierre([
          new ReglaTurnoConfirmado(),
          new ReglaHorarioAlcanzado(),
        ]),
    },
    CrearTurnoUseCase,
    ConfirmarTurnoUseCase,
    CancelarTurnoUseCase,
    RechazarTurnoUseCase,
    RegistrarInasistenciaUseCase,

    // Traducción interfaz -> clase concreta.
    // "cuando alguien pida 'ITurnoRepository', dale un PrismaTurnoRepository"
    {
      provide: 'ITurnoRepository',
      useClass: PrismaTurnoRepository,
    },
    {
      provide: 'IDisponibilidadRepository',
      useClass: PrismaDisponibilidadRepository,
    },
    {
      provide: 'IServicioRepository',
      useClass: PrismaServicioRepository,
    },
  ],
  // Los módulos de la Iteración 2 trabajan sobre los mismos turnos
  exports: ['ITurnoRepository'],
})
export class TurnosModule {}
