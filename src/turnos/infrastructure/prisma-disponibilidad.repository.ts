// src/turnos/infrastructure/prisma-disponibilidad.repository.ts
import { Injectable } from '@nestjs/common';
import {
  Disponibilidad as DisponibilidadPrisma,
  BloqueoFecha as BloqueoFechaPrisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

import {
  IDisponibilidadRepository,
  FranjaDisponibilidad,
  RangoBloqueo,
} from '../domain/puertos/disponibilidad-repository.port';

@Injectable()
export class PrismaDisponibilidadRepository
  implements IDisponibilidadRepository
{
  constructor(private readonly prisma: PrismaService) {}

  // Franjas en que el profesional atiende ese día de la semana (0=domingo … 6=sábado).
  async buscarFranjas(
    profesionalId: string,
    diaSemana: number,
  ): Promise<FranjaDisponibilidad[]> {
    const filas = await this.prisma.disponibilidad.findMany({
      where: { profesionalId, diaSemana },
    });

    return filas.map((fila) => this.franjaToDomain(fila));
  }

  // Bloqueos cuyo rango [inicio, fin] contiene la fecha consultada.
  async buscarBloqueos(
    profesionalId: string,
    fecha: Date,
  ): Promise<RangoBloqueo[]> {
    const filas = await this.prisma.bloqueoFecha.findMany({
      where: {
        profesionalId,
        fechaInicio: { lte: fecha }, // inicio <= fecha
        fechaFin: { gte: fecha }, //    fin >= fecha
      },
    });

    return filas.map((fila) => this.bloqueoToDomain(fila));
  }

  // --- Traductores: fila plana de Prisma -> tipo del puerto ---

  private franjaToDomain(fila: DisponibilidadPrisma): FranjaDisponibilidad {
    return {
      diaSemana: fila.diaSemana,
      horaInicio: this.formatearHora(fila.horaInicio),
      horaFin: this.formatearHora(fila.horaFin),
    };
  }

  private bloqueoToDomain(fila: BloqueoFechaPrisma): RangoBloqueo {
    return {
      fechaInicio: fila.fechaInicio,
      fechaFin: fila.fechaFin,
      motivo: fila.motivo ?? '',
    };
  }

  // Postgres @db.Time vuelve como Date; el puerto espera "HH:MM" (string).
  private formatearHora(hora: Date): string {
    return hora.toISOString().substring(11, 16); // "09:00"
  }
}