// src/turnos/domain/cierre/regla-medio-pago-admitido.ts
// RN-27: los medios de pago admitidos son efectivo y transferencia.
import { ReglaCierre } from './regla-cierre';
import { ContextoCierre } from './contexto-cierre';
import { Resultado } from '../validaciones/resultado';

export const MEDIOS_DE_PAGO_ADMITIDOS = ['EFECTIVO', 'TRANSFERENCIA'];

export class ReglaMedioPagoAdmitido implements ReglaCierre {
  validar(ctx: ContextoCierre): Resultado {
    if (!ctx.pago || !MEDIOS_DE_PAGO_ADMITIDOS.includes(ctx.pago.medioPago)) {
      return Resultado.error(
        'Medio de pago no admitido: solo EFECTIVO o TRANSFERENCIA.',
      );
    }
    return Resultado.ok();
  }
}
