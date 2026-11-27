// src/turnos/domain/cierre/regla-turno-confirmado.ts
// RN-26: solo se cobran o marcan como ausentes los turnos Confirmados.
import { ReglaCierre } from './regla-cierre';
import { ContextoCierre } from './contexto-cierre';
import { Resultado } from '../validaciones/resultado';

export class ReglaTurnoConfirmado implements ReglaCierre {
  validar(ctx: ContextoCierre): Resultado {
    if (ctx.turno.nombreEstado !== 'CONFIRMADO') {
      return Resultado.error(
        `El turno está en estado ${ctx.turno.nombreEstado}: solo se puede cerrar un turno CONFIRMADO.`,
      );
    }
    return Resultado.ok();
  }
}
