// src/turnos/domain/cierre/regla-transferencia-verificada.ts
// Una transferencia solo se registra si la profesional verificó la acreditación.
import { ReglaCierre } from './regla-cierre';
import { ContextoCierre } from './contexto-cierre';
import { Resultado } from '../validaciones/resultado';

export class ReglaTransferenciaVerificada implements ReglaCierre {
  validar(ctx: ContextoCierre): Resultado {
    if (
      ctx.pago?.medioPago === 'TRANSFERENCIA' &&
      !ctx.pago.transferenciaVerificada
    ) {
      return Resultado.error(
        'Confirmá que verificaste la acreditación de la transferencia antes de registrar el cobro.',
      );
    }
    return Resultado.ok();
  }
}
