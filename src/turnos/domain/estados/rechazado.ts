// src/turnos/domain/estados/rechazado.ts
import { EstadoTurno } from './estado-turno';
import { Turno } from '../turno.entity';
import { TransicionInvalidaError } from '../errors/transicion-invalida.error';

export class Rechazado implements EstadoTurno {
  nombre(): string {
    return 'RECHAZADO';
  }

  confirmar(_turno: Turno): void {
    throw new TransicionInvalidaError('confirmar', this.nombre());
  }

  reprogramar(_turno: Turno, _nuevaFecha: Date): void {
    throw new TransicionInvalidaError('reprogramar', this.nombre());
  }

  cancelar(_turno: Turno): void {
    throw new TransicionInvalidaError('cancelar', this.nombre());
  }

  rechazar(_turno: Turno): void {
    throw new TransicionInvalidaError('rechazar', this.nombre());
  }

  completar(_turno: Turno): void {
    throw new TransicionInvalidaError('completar', this.nombre());
  }
}