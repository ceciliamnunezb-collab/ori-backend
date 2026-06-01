// src/turnos/domain/validaciones/regla-validacion.ts
import { Turno } from '../turno.entity';
import { Resultado } from './resultado';

export interface ReglaValidacion {
  validar(turno: Turno): Promise<Resultado>;
}