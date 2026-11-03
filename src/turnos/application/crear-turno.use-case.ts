// src/turnos/application/crear-turno.use-case.ts
import { Turno } from '../domain/turno.entity';
import { TurnoFactory } from '../domain/turno.factory';
import { ValidadorTurno } from '../domain/validaciones/validador-turno';
import type { ITurnoRepository } from '../domain/puertos/turno-repository.port';
import { CrearTurnoCommand } from './crear-turno.command';
import { ResultadoOperacion } from './resultado-operacion';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class CrearTurnoUseCase {
  constructor(
    private readonly validador: ValidadorTurno,
    @Inject('ITurnoRepository')
    private readonly repo: ITurnoRepository,
  ) {}

  async ejecutar(cmd: CrearTurnoCommand): Promise<ResultadoOperacion<Turno>> {
    // 1. FABRICAR el turno según su origen (Factory Method)
    const turno =
      cmd.origen === 'cliente'
        ? TurnoFactory.desdeSolicitud(cmd)
        : TurnoFactory.porProfesional(cmd);

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
}