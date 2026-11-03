// src/turnos/domain/turno.factory.ts
import { randomUUID } from 'crypto';
import { Turno } from './turno.entity';
import { Pendiente } from './estados/pendiente';
import { Confirmado } from './estados/confirmado';
import { DetalleTurno } from './detalle-turno';

// Datos que llegan cuando una clienta pide turno desde el portal
export interface DatosSolicitudCliente {
  profesionalId: string;
  clienteId: string;
  fechaHora: Date;
  duracionMin: number;
  observaciones?: string;
  detalles?: DetalleTurno[];
}

// Datos que llegan cuando Debi carga un turno desde su panel
export interface DatosCargaProfesional {
  profesionalId: string;
  clienteId: string;
  fechaHora: Date;
  duracionMin: number;
  observaciones?: string;
  detalles?: DetalleTurno[];
}

export class TurnoFactory {
  // Origen 1: solicitud del cliente -> nace PENDIENTE
  static desdeSolicitud(datos: DatosSolicitudCliente): Turno {
    return new Turno({
      id: randomUUID(),
      profesionalId: datos.profesionalId,
      clienteId: datos.clienteId,
      fechaHora: datos.fechaHora,
      duracionMin: TurnoFactory.duracion(datos),
      estado: new Pendiente(),
      observaciones: datos.observaciones,
      detalles: datos.detalles,
    });
  }

  // Origen 2: carga del profesional -> nace CONFIRMADO
  static porProfesional(datos: DatosCargaProfesional): Turno {
    return new Turno({
      id: randomUUID(),
      profesionalId: datos.profesionalId,
      clienteId: datos.clienteId,
      fechaHora: datos.fechaHora,
      duracionMin: TurnoFactory.duracion(datos),
      estado: new Confirmado(),
      observaciones: datos.observaciones,
      detalles: datos.detalles,
    });
  }

  // RN-14: si el turno trae servicios, la duración es la suma de
  // sus duraciones aplicadas; si no, se respeta la duración indicada.
  private static duracion(datos: {
    duracionMin: number;
    detalles?: DetalleTurno[];
  }): number {
    if (datos.detalles && datos.detalles.length > 0) {
      return datos.detalles.reduce((t, d) => t + d.duracionAplicadaMin, 0);
    }
    return datos.duracionMin;
  }
}
