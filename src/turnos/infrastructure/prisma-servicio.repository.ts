// src/turnos/infrastructure/prisma-servicio.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  IServicioRepository,
  DatosServicio,
} from '../domain/puertos/servicio-repository.port';

@Injectable()
export class PrismaServicioRepository implements IServicioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorIds(ids: string[]): Promise<DatosServicio[]> {
    const filas = await this.prisma.servicio.findMany({
      where: { id: { in: ids } },
    });
    return filas.map((f) => ({
      id: f.id,
      nombre: f.nombre,
      duracionMin: f.duracionMin,
      // RN-05: sin precio cargado o "a consultar" -> null
      precio:
        f.precio === null || f.visibilidadPrecio === 'A_CONSULTAR'
          ? null
          : Number(f.precio),
      activo: f.activo,
      diasSeguimiento: f.diasSeguimiento,
    }));
  }
}
