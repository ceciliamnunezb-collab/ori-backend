// src/turnos/domain/cierre/validador-cierre.ts
// Ejecuta todas las reglas de cierre y combina sus resultados.
// Se arman dos validadores con distintas reglas (ver módulos):
//  - inasistencia: turno confirmado + horario alcanzado
//  - cobro: las anteriores + importe, medio de pago y transferencia
import { ReglaCierre } from './regla-cierre';
import { ContextoCierre } from './contexto-cierre';
import { Resultado } from '../validaciones/resultado';

export class ValidadorCierre {
  constructor(private readonly reglas: ReglaCierre[]) {}

  validar(ctx: ContextoCierre): Resultado {
    return Resultado.combinar(this.reglas.map((r) => r.validar(ctx)));
  }
}
