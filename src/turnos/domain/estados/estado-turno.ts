// src/turnos/domain/estados/estado-turno.ts
import { Turno } from '../turno.entity';

export interface EstadoTurno {
  confirmar(turno: Turno): void;
  reprogramar(turno: Turno, nuevaFecha: Date): void;
  cancelar(turno: Turno): void;
  rechazar(turno: Turno): void;
  completar(turno: Turno): void;
  nombre(): string;
}