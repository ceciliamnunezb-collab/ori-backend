// src/notificaciones/infrastructure/prisma-datos-notificacion.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DatosCliente,
  IDatosNotificacionRepository,
} from '../domain/puertos/datos-notificacion.port';
import { TipoNotificacion } from '../domain/tipo-notificacion';

const HORAS_ANTES_POR_DEFECTO = 24; // RN-06

@Injectable()
export class PrismaDatosNotificacionRepository implements IDatosNotificacionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async buscarCliente(clienteId: string): Promise<DatosCliente | null> {
    const c = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
    });
    return c ? { id: c.id, nombre: c.nombre, telefono: c.telefono } : null;
  }

  async plantilla(tipo: TipoNotificacion): Promise<string> {
    const t = await this.prisma.tipoNotificacion.findUnique({
      where: { codigo: tipo },
    });
    if (!t)
      throw new Error(`Falta la plantilla del tipo de notificación ${tipo}.`);
    return t.plantillaMensaje;
  }

  async horasAntesRecordatorio(profesionalId: string): Promise<number> {
    const conf = await this.prisma.configuracionSistema.findUnique({
      where: { profesionalId },
    });
    return conf?.horasAntesRecordatorio ?? HORAS_ANTES_POR_DEFECTO;
  }
}
