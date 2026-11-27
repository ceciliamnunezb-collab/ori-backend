// src/cobros/infrastructure/prisma-cobro.repository.ts
import { Injectable } from '@nestjs/common';
import { EstadoTurno as EstadoTurnoEnum } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CobroVista,
  ICobroRepository,
} from '../domain/puertos/cobro-repository.port';
import { Cobro } from '../domain/cobro.entity';
import { MedioPago } from '../domain/medio-pago';
import { Turno } from '../../turnos/domain/turno.entity';
import { Notificacion } from '../../notificaciones/domain/notificacion.entity';
import { notificacionToCreate } from '../../notificaciones/infrastructure/mapa-notificacion';

@Injectable()
export class PrismaCobroRepository implements ICobroRepository {
  constructor(private readonly prisma: PrismaService) {}

  async registrarCierre(
    cobro: Cobro,
    turno: Turno,
    seguimiento: Notificacion | null,
  ): Promise<void> {
    // Todo o nada: si algo falla, el turno no queda Completado sin su cobro.
    await this.prisma.$transaction(async (tx) => {
      await tx.cobro.create({
        data: {
          id: cobro.getId,
          turnoId: cobro.getTurnoId,
          fechaHora: cobro.getFechaHora,
          importeSugerido: cobro.getImporteSugerido,
          importe: cobro.getImporte,
          medioPago: cobro.getMedioPago,
          transferenciaVerificada: cobro.getTransferenciaVerificada,
        },
      });

      await tx.turno.update({
        where: { id: turno.getId },
        data: {
          estado: turno.nombreEstado as EstadoTurnoEnum,
          requiereSeguimiento: turno.getRequiereSeguimiento,
        },
      });

      // Congela el precio aplicado de cada servicio del turno
      for (const d of turno.getDetalles) {
        if (d.getPrecioAplicado === null) continue;
        await tx.turnoServicio.update({
          where: {
            turnoId_servicioId: {
              turnoId: turno.getId,
              servicioId: d.servicioId,
            },
          },
          data: { precioAplicado: d.getPrecioAplicado },
        });
      }

      if (seguimiento) {
        await tx.notificacion.create({
          data: notificacionToCreate(seguimiento),
        });
      }
    });
  }

  async listarPorPeriodo(desde: Date, hasta: Date): Promise<CobroVista[]> {
    const filas = await this.prisma.cobro.findMany({
      where: { fechaHora: { gte: desde, lte: hasta } },
      include: {
        turno: {
          include: {
            cliente: true,
            turnoServicios: { include: { servicio: true } },
          },
        },
      },
      orderBy: { fechaHora: 'desc' },
    });
    return filas.map((f) => ({
      id: f.id,
      fechaHora: f.fechaHora,
      importe: Number(f.importe),
      medioPago: f.medioPago as MedioPago,
      turnoId: f.turnoId,
      cliente: f.turno.cliente.nombre,
      servicios: f.turno.turnoServicios.map((ts) => ts.servicio.nombre),
    }));
  }
}
