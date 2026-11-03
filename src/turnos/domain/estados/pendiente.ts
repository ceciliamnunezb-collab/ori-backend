// src/turnos/domain/estados/pendiente.ts
import { EstadoTurno } from './estado-turno';
import { Turno } from '../turno.entity';
import { Confirmado } from './confirmado';
import { Rechazado } from './rechazado';
import { TransicionInvalidaError } from '../errors/transicion-invalida.error';

export class Pendiente implements EstadoTurno {
  nombre(): string {
    return 'PENDIENTE';
  }

  confirmar(turno: Turno): void {
    turno.cambiarEstado(new Confirmado());
  }

  rechazar(turno: Turno): void {
    turno.cambiarEstado(new Rechazado());
  }

  // --- transiciones inválidas desde Pendiente ---

  reprogramar(_turno: Turno, _nuevaFecha: Date): void {
    throw new TransicionInvalidaError('reprogramar', this.nombre());
  }

  cancelar(_turno: Turno): void {
    throw new TransicionInvalidaError('cancelar', this.nombre());
  }

  completar(_turno: Turno): void {
    throw new TransicionInvalidaError('completar', this.nombre());
  }
}