// src/turnos/domain/estados/ausente.ts
// Iteración 2: estado final para el cliente que no se presentó (RN-31).
// Desde Ausente no hay transiciones válidas.
import { EstadoTurno } from './estado-turno';
import { Turno } from '../turno.entity';
import { TransicionInvalidaError } from '../errors/transicion-invalida.error';

export class Ausente implements EstadoTurno {
  nombre(): string {
    return 'AUSENTE';
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

  registrarInasistencia(_turno: Turno): void {
    throw new TransicionInvalidaError(
      'registrar la inasistencia de',
      this.nombre(),
    );
  }
}
