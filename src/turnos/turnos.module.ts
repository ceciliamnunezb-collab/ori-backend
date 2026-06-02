// src/turnos/turnos.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CrearTurnoUseCase } from './application/crear-turno.use-case';
import { ValidadorTurno } from './domain/validaciones/validador-turno';

import { PrismaTurnoRepository } from './infrastructure/prisma-turno.repository';
import { PrismaDisponibilidadRepository } from './infrastructure/prisma-disponibilidad.repository';

import { TurnosController } from './turnos.controller';
import { ReglaFechaNoPasada } from './domain/validaciones/regla-fecha-no-pasada';
import { ReglaVentanaReserva } from './domain/validaciones/regla-ventana-reserva';
import { ReglaSuperposicion } from './domain/validaciones/regla-superposicion';
import { ITurnoRepository } from './domain/puertos/turno-repository.port';

@Module({
  controllers: [TurnosController],
  providers: [
    PrismaService,
    {
      provide: ValidadorTurno,
      useFactory: (repo: ITurnoRepository) => {
        return new ValidadorTurno([
          new ReglaFechaNoPasada(),
          new ReglaVentanaReserva(30),
          new ReglaSuperposicion(repo, 2),
        ]);
      },
      inject: ['ITurnoRepository'],
    },
    CrearTurnoUseCase,

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
  ],
})
export class TurnosModule {}