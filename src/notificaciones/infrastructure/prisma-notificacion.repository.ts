// src/notificaciones/infrastructure/prisma-notificacion.repository.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  FiltroNotificaciones,
  INotificacionRepository,
  NotificacionVista,
} from '../domain/puertos/notificacion-repository.port';
import { Notificacion } from '../domain/notificacion.entity';
import { TipoNotificacion } from '../domain/tipo-notificacion';
import { EstadoNotificacion } from '../domain/estado-notificacion';
import {
  notificacionToCreate,
  notificacionToDomain,
} from './mapa-notificacion';

@Injectable()
export class PrismaNotificacionRepository implements INotificacionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(n: Notificacion): Promise<void> {
    await this.prisma.notificacion.create({ data: notificacionToCreate(n) });
  }

  async buscarPorId(id: string): Promise<Notificacion | null> {
    const fila = await this.prisma.notificacion.findUnique({
      where: { id },
      include: { tipoNotificacion: true },
    });
    return fila ? notificacionToDomain(fila) : null;
  }

  async actualizar(n: Notificacion): Promise<void> {
    await this.prisma.notificacion.update({
      where: { id: n.getId },
      data: {
        mensaje: n.getMensaje,
        estado: n.getEstado,
        fechaEnvio: n.getFechaEnvio,
      },
    });
  }

  async existeParaTurno(
    turnoId: string,
    tipo: TipoNotificacion,
  ): Promise<boolean> {
    const cantidad = await this.prisma.notificacion.count({
      where: { turnoId, tipoNotificacion: { codigo: tipo } },
    });
    return cantidad > 0;
  }

  async listar(filtro: FiltroNotificaciones): Promise<NotificacionVista[]> {
    const where: Prisma.NotificacionWhereInput = {};
    if (filtro.estado) where.estado = filtro.estado;
    if (filtro.tipo) where.tipoNotificacion = { codigo: filtro.tipo };
    if (filtro.programadasHasta)
      where.fechaProgramada = { lte: filtro.programadasHasta };

    const filas = await this.prisma.notificacion.findMany({
      where,
      include: { tipoNotificacion: true, cliente: true },
      orderBy: { fechaProgramada: 'asc' },
    });
    return filas.map((f) => ({
      id: f.id,
      tipo: f.tipoNotificacion.codigo as TipoNotificacion,
      estado: f.estado as EstadoNotificacion,
      mensaje: f.mensaje,
      fechaProgramada: f.fechaProgramada,
      fechaEnvio: f.fechaEnvio,
      turnoId: f.turnoId,
      cliente: {
        id: f.cliente.id,
        nombre: f.cliente.nombre,
        telefono: f.cliente.telefono,
      },
    }));
  }
}
