// src/turnos/domain/cierre/regla-horario-alcanzado.ts
// RN-26: el turno solo se cierra cuando su horario de inicio ya llegó.
import { ReglaCierre } from './regla-cierre';
import { ContextoCierre } from './contexto-cierre';
import { Resultado } from '../validaciones/resultado';

export class ReglaHorarioAlcanzado implements ReglaCierre {
  validar(ctx: ContextoCierre): Resultado {
    if (!ctx.turno.haComenzado(ctx.ahora)) {
      return Resultado.error(
        `El turno todavía no comenzó: se puede cerrar a partir ${this.cuando(ctx.turno.getFechaHora, ctx.ahora)}.`,
      );
    }
    return Resultado.ok();
  }

  // "de hoy a las 17:00" o "del 21/11 a las 17:00"
  private cuando(f: Date, ahora: Date): string {
    const dos = (n: number) => n.toString().padStart(2, '0');
    const hora = `${dos(f.getHours())}:${dos(f.getMinutes())}`;
    const mismoDia = f.toDateString() === ahora.toDateString();
    return mismoDia
      ? `de hoy a las ${hora}`
      : `del ${dos(f.getDate())}/${dos(f.getMonth() + 1)} a las ${hora}`;
  }
}
