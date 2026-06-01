// src/turnos/domain/validaciones/regla-disponibilidad.ts
import { ReglaValidacion } from './regla-validacion';
import { Turno } from '../turno.entity';
import { Resultado } from './resultado';
import { IDisponibilidadRepository } from '../puertos/disponibilidad-repository.port';

export class ReglaDisponibilidad implements ReglaValidacion {
  constructor(private readonly repo: IDisponibilidadRepository) {}

  async validar(turno: Turno): Promise<Resultado> {
    const fecha = turno.getFechaHora;
    const profesionalId = turno.getProfesionalId;

    // 1. ¿Hay un bloqueo en esa fecha? (vacaciones, feriado)
    const bloqueos = await this.repo.buscarBloqueos(profesionalId, fecha);
    if (bloqueos.length > 0) {
      return Resultado.error(
        `El profesional no atiende esa fecha: ${bloqueos[0].motivo}.`,
      );
    }

    // 2. ¿Atiende ese día de la semana?
    const diaSemana = fecha.getDay(); // 0=domingo ... 6=sábado
    const franjas = await this.repo.buscarFranjas(profesionalId, diaSemana);
    if (franjas.length === 0) {
      return Resultado.error('El profesional no atiende ese día.');
    }

    // 3. ¿La hora del turno cae dentro de alguna franja?
    const horaTurno = this.formatearHora(fecha); // "14:30"
    const entraEnAlgunaFranja = franjas.some(
      (f) => horaTurno >= f.horaInicio && horaTurno <= f.horaFin,
    );

    if (!entraEnAlgunaFranja) {
      return Resultado.error('El horario está fuera del horario de atención.');
    }

    return Resultado.ok();
  }

  private formatearHora(fecha: Date): string {
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
  }
}