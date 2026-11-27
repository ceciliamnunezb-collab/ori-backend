// src/turnos/domain/validaciones/regla-superposicion.ts
import { ReglaValidacion } from './regla-validacion';
import { Turno } from '../turno.entity';
import { Resultado } from './resultado';
import { ITurnoRepository } from '../puertos/turno-repository.port';
import { IDisponibilidadRepository } from '../puertos/disponibilidad-repository.port';

export class ReglaSuperposicion implements ReglaValidacion {
  constructor(
    private readonly repo: ITurnoRepository,
    private readonly repoDisponibilidad: IDisponibilidadRepository,
  ) {}

  async validar(turno: Turno): Promise<Resultado> {
    const solapados = await this.repo.buscarSolapados(
      turno.getProfesionalId,
      turno.getFechaHora,
      turno.getDuracionMin,
      turno.getId, // al revalidar un turno existente, no se cuenta a sí mismo
    );

    // El máximo lo configura el profesional (RF-02.4); no está fijo en el código.
    const maxSimultaneos = await this.repoDisponibilidad.obtenerMaxSimultaneos(
      turno.getProfesionalId,
    );

    // ¿Cuántos turnos cabrían contando el nuevo?
    const totalConElNuevo = solapados.length + 1;

    if (totalConElNuevo > maxSimultaneos) {
      return Resultado.error(
        `El horario supera el máximo de ${maxSimultaneos} turno(s) simultáneo(s).`,
      );
    }

    return Resultado.ok();
  }
}
