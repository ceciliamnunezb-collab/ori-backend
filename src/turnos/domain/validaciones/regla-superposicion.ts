// src/turnos/domain/validaciones/regla-superposicion.ts
import { ReglaValidacion } from './regla-validacion';
import { Turno } from '../turno.entity';
import { Resultado } from './resultado';
import { ITurnoRepository } from '../puertos/turno-repository.port';

export class ReglaSuperposicion implements ReglaValidacion {
  constructor(
    private readonly repo: ITurnoRepository,
    private readonly maxSimultaneos: number,
  ) {}

  async validar(turno: Turno): Promise<Resultado> {
    const solapados = await this.repo.buscarSolapados(
      turno.getProfesionalId,
      turno.getFechaHora,
      turno.getDuracionMin,
    );

    // ¿Cuántos turnos cabrían contando el nuevo?
    const totalConElNuevo = solapados.length + 1;

    if (totalConElNuevo > this.maxSimultaneos) {
      return Resultado.error(
        `El horario supera el máximo de ${this.maxSimultaneos} turno(s) simultáneo(s).`,
      );
    }

    return Resultado.ok();
  }
}