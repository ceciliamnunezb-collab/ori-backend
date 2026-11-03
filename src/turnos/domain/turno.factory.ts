// src/turnos/domain/turno.factory.ts
import { randomUUID } from 'crypto';
import { Turno } from './turno.entity';
import { Pendiente } from './estados/pendiente';
import { Confirmado } from './estados/confirmado';

// Datos que llegan cuando una clienta pide turno desde el portal
export interface DatosSolicitudCliente {
  profesionalId: string;
  clienteId: string;
  fechaHora: Date;
  duracionMin: number;
  observaciones?: string;
}

// Datos que llegan cuando Debi carga un turno desde su panel
export interface DatosCargaProfesional {
  profesionalId: string;
  clienteId: string;
  fechaHora: Date;
  duracionMin: number;
  observaciones?: string;
}

export class TurnoFactory {
  // Origen 1: solicitud del cliente -> nace PENDIENTE
  static desdeSolicitud(datos: DatosSolicitudCliente): Turno {
    return new Turno({
      id: randomUUID(),
      profesionalId: datos.profesionalId,
      clienteId: datos.clienteId,
      fechaHora: datos.fechaHora,
      duracionMin: datos.duracionMin,
      estado: new Pendiente(),
      observaciones: datos.observaciones,
    });
  }

  // Origen 2: carga del profesional -> nace CONFIRMADO
  static porProfesional(datos: DatosCargaProfesional): Turno {
    return new Turno({
      id: randomUUID(),
      profesionalId: datos.profesionalId,
      clienteId: datos.clienteId,
      fechaHora: datos.fechaHora,
      duracionMin: datos.duracionMin,
      estado: new Confirmado(),
      observaciones: datos.observaciones,
    });
  }
}