// src/turnos/infrastructure/prisma-turno.repository.ts
import { Injectable } from '@nestjs/common';
import { EstadoTurno as EstadoTurnoEnum, Turno as TurnoPrisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

import { ITurnoRepository } from '../domain/puertos/turno-repository.port';
import { Turno } from '../domain/turno.entity';
import { EstadoTurno } from '../domain/estados/estado-turno';
import { Pendiente } from '../domain/estados/pendiente';
import { Confirmado } from '../domain/estados/confirmado';
import { Cancelado } from '../domain/estados/cancelado';
import { Rechazado } from '../domain/estados/rechazado';
import { Completado } from '../domain/estados/completado';

// Mapa: del string del enum de Postgres a la instancia de dominio.
// Cada valor es una FUNCIÓN constructora, para crear un estado fresco
// por cada turno reconstruido (nunca compartir la instancia por referencia).
const MAPA_ESTADOS: Record<EstadoTurnoEnum, () => EstadoTurno> = {
  PENDIENTE: () => new Pendiente(),
  CONFIRMADO: () => new Confirmado(),
  CANCELADO: () => new Cancelado(),
  RECHAZADO: () => new Rechazado(),
  COMPLETADO: () => new Completado(),
};

@Injectable()
export class PrismaTurnoRepository implements ITurnoRepository {
  constructor(private readonly prisma: PrismaService) {}

  // --- Operaciones del puerto ---

  async guardar(turno: Turno): Promise<void> {
    const datos = this.toPersistence(turno);
    await this.prisma.turno.create({ data: datos });
  }

  async buscarSolapados(
    profesionalId: string,
    fechaHora: Date,
    duracionMin: number,
  ): Promise<Turno[]> {
    // El cálculo de solape sucede DENTRO de Postgres.
    // Un turno existente se solapa con el nuevo si:
    //   inicio_existente < fin_nuevo  AND  fin_existente > inicio_nuevo
    // donde fin = inicio + duración (calculado con make_interval).
    const filas = await this.prisma.$queryRaw<TurnoPrisma[]>`
      SELECT *
      FROM turno
      WHERE profesional_id = ${profesionalId}::uuid
        AND estado IN ('PENDIENTE', 'CONFIRMADO')
        AND fecha_hora
            < ${fechaHora}::timestamp + make_interval(mins => ${duracionMin}::int)
        AND fecha_hora + make_interval(mins => duracion_min)
            > ${fechaHora}::timestamp
    `;

    return filas.map((fila) => this.toDomain(fila));
  }

  // --- Traductores entre el mundo Prisma y el dominio ---

  // Fila plana de Postgres -> entidad rica de dominio.
  private toDomain(fila: TurnoPrisma): Turno {
    return new Turno({
      id: fila.id,
      profesionalId: fila.profesionalId,
      clienteId: fila.clienteId,
      fechaHora: fila.fechaHora,
      duracionMin: fila.duracionMin,
      estado: MAPA_ESTADOS[fila.estado](),
      observaciones: fila.observaciones ?? undefined,
    });
  }

  // Entidad rica de dominio -> objeto plano para Prisma.
  private toPersistence(turno: Turno) {
    return {
      id: turno.getId,
      profesionalId: turno.getProfesionalId,
      clienteId: turno.getClienteId,
      fechaHora: turno.getFechaHora,
      duracionMin: turno.getDuracionMin,
      estado: turno.nombreEstado as EstadoTurnoEnum,
      observaciones: turno.getObservaciones ?? null,
    };
  }
}