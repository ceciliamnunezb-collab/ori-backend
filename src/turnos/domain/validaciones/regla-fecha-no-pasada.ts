// src/turnos/domain/validaciones/regla-fecha-no-pasada.ts
import { ReglaValidacion } from './regla-validacion';
import { Turno } from '../turno.entity';
import { Resultado } from './resultado';

export class ReglaFechaNoPasada implements ReglaValidacion {
  async validar(turno: Turno): Promise<Resultado> {
    const ahora = new Date();

    if (turno.getFechaHora <= ahora) {
      return Resultado.error('La fecha del turno no puede ser anterior a hoy.');
    }

    return Resultado.ok();
  }
}