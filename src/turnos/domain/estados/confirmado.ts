// src/turnos/domain/estados/confirmado.ts
import { EstadoTurno } from './estado-turno';
import { Turno } from '../turno.entity';
import { Cancelado } from './cancelado';
import { Completado } from './completado';
import { TransicionInvalidaError } from '../errors/transicion-invalida.error';

export class Confirmado implements EstadoTurno {
  nombre(): string {
    return 'CONFIRMADO';
  }

  reprogramar(turno: Turno, nuevaFecha: Date): void {
    turno.asignarFecha(nuevaFecha);
    // NO hay cambiarEstado: el turno sigue Confirmado, solo cambió la fecha
  }

  cancelar(turno: Turno): void {
    turno.cambiarEstado(new Cancelado());
  }

  completar(turno: Turno): void {
    turno.cambiarEstado(new Completado());
  }

  // --- transiciones inválidas desde Confirmado ---

  confirmar(_turno: Turno): void {
    throw new TransicionInvalidaError('confirmar', this.nombre());
  }

  rechazar(_turno: Turno): void {
    throw new TransicionInvalidaError('rechazar', this.nombre());
  }
}