// src/turnos/application/crear-turno.command.ts
export type OrigenTurno = 'cliente' | 'profesional';

export interface CrearTurnoCommand {
  origen: OrigenTurno;
  profesionalId: string;
  clienteId: string;
  fechaHora: Date;
  duracionMin: number;
  observaciones?: string;
}