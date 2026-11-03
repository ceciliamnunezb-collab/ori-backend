// src/turnos/application/crear-turno.command.ts
export type OrigenTurno = 'cliente' | 'profesional';

export interface CrearTurnoCommand {
  origen: OrigenTurno;
  profesionalId: string;
  clienteId: string;
  fechaHora: Date;
  duracionMin: number;
  observaciones?: string;
  // Iteración 2 (multi-servicio, RN-14): si se informan servicios,
  // la duración del turno se calcula como la suma de sus duraciones.
  servicioIds?: string[];
}
