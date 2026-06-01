// src/turnos/domain/validaciones/regla-ventana-reserva.ts
import { ReglaValidacion } from './regla-validacion';
import { Turno } from '../turno.entity';
import { Resultado } from './resultado';

export class ReglaVentanaReserva implements ReglaValidacion {
  constructor(private readonly ventanaDias: number) {}

  async validar(turno: Turno): Promise<Resultado> {
    const ahora = new Date();
    const limite = new Date();
    limite.setDate(ahora.getDate() + this.ventanaDias);

    if (turno.getFechaHora > limite) {
      return Resultado.error(
        `No se puede reservar con más de ${this.ventanaDias} días de anticipación.`,
      );
    }

    return Resultado.ok();
  }
}