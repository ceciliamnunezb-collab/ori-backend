// src/turnos/domain/errors/transicion-invalida.error.ts
export class TransicionInvalidaError extends Error {
  constructor(accion: string, estadoActual: string) {
    super(`No se puede ${accion} un turno en estado ${estadoActual}.`);
    this.name = 'TransicionInvalidaError';
  }
}