// src/turnos/domain/cierre/contexto-cierre.ts
// Datos que reciben las reglas de cierre del turno (Iteración 2).
import { Turno } from '../turno.entity';

export interface DatosPago {
  importe: number;
  medioPago: string;
  transferenciaVerificada: boolean;
}

export interface ContextoCierre {
  turno: Turno;
  ahora: Date;
  pago?: DatosPago; // solo presente al registrar un cobro
}
