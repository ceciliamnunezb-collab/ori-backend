// src/turnos/domain/cierre/regla-cierre.ts
// Patrón Strategy: cada regla de cierre del turno es una estrategia
// intercambiable. Reutiliza el mismo Resultado que las reglas de creación.
import { ContextoCierre } from './contexto-cierre';
import { Resultado } from '../validaciones/resultado';

export interface ReglaCierre {
  validar(ctx: ContextoCierre): Resultado;
}
