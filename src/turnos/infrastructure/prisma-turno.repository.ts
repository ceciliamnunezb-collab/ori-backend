// src/turnos/infrastructure/prisma-turno.repository.ts
import { Injectable } from '@nestjs/common';
import {
  EstadoTurno as EstadoTurnoEnum,
  Prisma,
  Turno as TurnoPrisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

import { ITurnoRepository } from '../domain/puertos/turno-repository.port';
import { Turno } from '../domain/turno.entity';
import { DetalleTurno } from '../domain/detalle-turno';
import { EstadoTurno } from '../domain/estados/estado-turno';
import { Pendiente } from '../domain/estados/pendiente';
import { Confirmado } from '../domain/estados/confirmado';
import { Cancelado } from '../domain/estados/cancelado';
import { Rechazado } from '../domain/estados/rechazado';
import { Completado } from '../domain/estados/completado';
import { Ausente } from '../domain/estados/ausente';

// Mapa: del string del enum de Postgres a la instancia de dominio.
// Cada valor es una FUNCIÓN constructora, para crear un estado fresco
// por cada turno reconstruido (nunca compartir la instancia por referencia).
const MAPA_ESTADOS: Record<EstadoTurnoEnum, () => EstadoTurno> = {
  PENDIENTE: () => new Pendiente(),
  CONFIRMADO: () => new Confirmado(),
  CANCELADO: () => new Cancelado(),
  RECHAZADO: () => new Rechazado(),
  COMPLETADO: () => new Completado(),
  AUSENTE: () => new Ausente(),
};

// Turno leído junto con sus servicios (para armar los DetalleTurno)
const CON_SERVICIOS = {
  turnoServicios: { include: { servicio: true } },
} satisfies Prisma.TurnoInclude;
type TurnoConServicios = Prisma.TurnoGetPayload<{
  include: typeof CON_SERVICIOS;
}>;

@Injectable()
export class PrismaTurnoRepository implements ITurnoRepository {
  constructor(private readonly prisma: PrismaService) {}

  // --- Operaciones del puerto ---

  async guardar(turno: Turno): Promise<void> {
    const datos = this.toPersistence(turno);
    await this.prisma.turno.create({
      data: {
        ...datos,
        // Los detalles se crean junto con el turno (composición)
        turnoServicios: {
          create: turno.getDetalles.map((d) => ({
            servicioId: d.servicioId,
            duracionAplicadaMin: d.duracionAplicadaMin,
          })),
        },
      },
    });
  }

  async buscarSolapados(
    profesionalId: string,
    fechaHora: Date,
    duracionMin: number,
    excluirTurnoId?: string,
  ): Promise<Turno[]> {
    // El cálculo de solape sucede DENTRO de Postgres.
    // Un turno existente se solapa con el nuevo si:
    //   inicio_existente < fin_nuevo  AND  fin_existente > inicio_nuevo
    // donde fin = inicio + duración (calculado con make_interval).
    // Solo cuentan PENDIENTE y CONFIRMADO: un turno AUSENTE libera su franja (RN-31).
    // Las columnas se renombran para que la fila tenga la forma del modelo Prisma.
    const excluir = excluirTurnoId ?? '00000000-0000-0000-0000-000000000000';
    const filas = await this.prisma.$queryRaw<TurnoPrisma[]>`
      SELECT id,
             profesional_id       AS "profesionalId",
             cliente_id           AS "clienteId",
             fecha_hora           AS "fechaHora",
             duracion_min         AS "duracionMin",
             estado,
             observaciones,
             requiere_seguimiento AS "requiereSeguimiento"
      FROM turno
      WHERE profesional_id = ${profesionalId}::uuid
        AND id <> ${excluir}::uuid
        AND estado IN ('PENDIENTE', 'CONFIRMADO')
        AND fecha_hora
            < ${fechaHora}::timestamp + make_interval(mins => ${duracionMin}::int)
        AND fecha_hora + make_interval(mins => duracion_min)
            > ${fechaHora}::timestamp
    `;

    return filas.map((fila) => this.toDomain(fila));
  }

  async buscarPorId(id: string): Promise<Turno | null> {
    const fila = await this.prisma.turno.findUnique({
      where: { id },
      include: CON_SERVICIOS,
    });
    return fila ? this.toDomain(fila) : null;
  }

  async actualizar(turno: Turno): Promise<void> {
    await this.prisma.turno.update({
      where: { id: turno.getId },
      data: {
        fechaHora: turno.getFechaHora,
        estado: turno.nombreEstado as EstadoTurnoEnum,
        observaciones: turno.getObservaciones ?? null,
        requiereSeguimiento: turno.getRequiereSeguimiento,
      },
    });
  }

  async buscarConfirmadosEntre(desde: Date, hasta: Date): Promise<Turno[]> {
    const filas = await this.prisma.turno.findMany({
      where: { estado: 'CONFIRMADO', fechaHora: { gte: desde, lte: hasta } },
      include: CON_SERVICIOS,
      orderBy: { fechaHora: 'asc' },
    });
    return filas.map((f) => this.toDomain(f));
  }

  // --- Traductores entre el mundo Prisma y el dominio ---

  // Fila plana de Postgres -> entidad rica de dominio.
  private toDomain(fila: TurnoPrisma | TurnoConServicios): Turno {
    const servicios = 'turnoServicios' in fila ? fila.turnoServicios : [];
    return new Turno({
      id: fila.id,
      profesionalId: fila.profesionalId,
      clienteId: fila.clienteId,
      fechaHora: fila.fechaHora,
      duracionMin: fila.duracionMin,
      estado: MAPA_ESTADOS[fila.estado](),
      observaciones: fila.observaciones ?? undefined,
      requiereSeguimiento: fila.requiereSeguimiento ?? false,
      detalles: servicios.map(
        (ts) =>
          new DetalleTurno(
            ts.servicioId,
            ts.servicio.nombre,
            ts.duracionAplicadaMin,
            ts.servicio.precio === null ||
              ts.servicio.visibilidadPrecio === 'A_CONSULTAR'
              ? null
              : Number(ts.servicio.precio),
            ts.servicio.diasSeguimiento,
            ts.precioAplicado === null ? null : Number(ts.precioAplicado),
          ),
      ),
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
      requiereSeguimiento: turno.getRequiereSeguimiento,
    };
  }
}
