// src/turnos/domain/cierre/regla-importe-positivo.ts
// RN-29: el importe cobrado debe ser mayor a cero.
import { ReglaCierre } from './regla-cierre';
import { ContextoCierre } from './contexto-cierre';
import { Resultado } from '../validaciones/resultado';

export class ReglaImportePositivo implements ReglaCierre {
  validar(ctx: ContextoCierre): Resultado {
    const importe = ctx.pago?.importe;
    if (importe === undefined || !Number.isFinite(importe) || importe <= 0) {
      return Resultado.error('El importe cobrado debe ser mayor a cero.');
    }
    return Resultado.ok();
  }
}
