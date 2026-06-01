// src/turnos/domain/validaciones/validador-turno.ts
import { ReglaValidacion } from './regla-validacion';
import { Turno } from '../turno.entity';
import { Resultado } from './resultado';

export class ValidadorTurno {
  constructor(private readonly reglas: ReglaValidacion[]) {}

  async validar(turno: Turno): Promise<Resultado> {
    const resultados = await Promise.all(
      this.reglas.map((regla) => regla.validar(turno)),
    );
    return Resultado.combinar(resultados);
  }
}