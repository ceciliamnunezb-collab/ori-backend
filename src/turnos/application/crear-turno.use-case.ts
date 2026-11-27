// src/turnos/application/crear-turno.use-case.ts
import { Turno } from '../domain/turno.entity';
import { TurnoFactory } from '../domain/turno.factory';
import { ValidadorTurno } from '../domain/validaciones/validador-turno';
import type { ITurnoRepository } from '../domain/puertos/turno-repository.port';
import type { IServicioRepository } from '../domain/puertos/servicio-repository.port';
import { DetalleTurno } from '../domain/detalle-turno';
import { CrearTurnoCommand } from './crear-turno.command';
import { ResultadoOperacion } from './resultado-operacion';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class CrearTurnoUseCase {
  constructor(
    private readonly validador: ValidadorTurno,
    @Inject('ITurnoRepository')
    private readonly repo: ITurnoRepository,
    @Inject('IServicioRepository')
    private readonly servicios: IServicioRepository,
  ) {}

  async ejecutar(cmd: CrearTurnoCommand): Promise<ResultadoOperacion<Turno>> {
    // 0. Armar los detalles del turno a partir de los servicios (RN-14)
    const detalles = await this.armarDetalles(cmd.servicioIds);
    if (!detalles.exito) {
      return ResultadoOperacion.fallo(detalles.errores);
    }
    const datos = { ...cmd, detalles: detalles.valor };

    // 1. FABRICAR el turno según su origen (Factory Method)
    const turno =
      cmd.origen === 'cliente'
        ? TurnoFactory.desdeSolicitud(datos)
        : TurnoFactory.porProfesional(datos);

    // 2. VALIDAR con las reglas (Strategy)
    const validacion = await this.validador.validar(turno);

    // 3. Si NO pasa, devolver los errores sin guardar
    if (!validacion.esValido) {
      return ResultadoOperacion.fallo(validacion.errores);
    }

    // 4. Si pasa, GUARDAR (a través del puerto)
    await this.repo.guardar(turno);

    // 5. Devolver el turno creado
    return ResultadoOperacion.ok(turno);
  }

  private async armarDetalles(
    servicioIds?: string[],
  ): Promise<ResultadoOperacion<DetalleTurno[]>> {
    if (!servicioIds || servicioIds.length === 0) {
      return ResultadoOperacion.ok([]);
    }
    const unicos = [...new Set(servicioIds)];
    const encontrados = await this.servicios.buscarPorIds(unicos);
    if (encontrados.length !== unicos.length) {
      return ResultadoOperacion.fallo(['Uno o más servicios no existen.']);
    }
    const inactivos = encontrados.filter((s) => !s.activo);
    if (inactivos.length > 0) {
      return ResultadoOperacion.fallo([
        `Servicio no disponible: ${inactivos.map((s) => s.nombre).join(', ')}.`,
      ]);
    }
    return ResultadoOperacion.ok(
      encontrados.map(
        (s) =>
          new DetalleTurno(
            s.id,
            s.nombre,
            s.duracionMin,
            s.precio,
            s.diasSeguimiento,
          ),
      ),
    );
  }
}
