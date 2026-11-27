// src/turnos/application/transiciones-turno.use-case.ts
// Iteración 2 (H2.4): operaciones del ciclo de vida del turno.
// Todas siguen el mismo esquema: buscar -> validar -> aplicar la
// transición (el patrón State decide si es válida) -> persistir.
import { Injectable, Inject } from '@nestjs/common';
import { Turno } from '../domain/turno.entity';
import type { ITurnoRepository } from '../domain/puertos/turno-repository.port';
import { ValidadorTurno } from '../domain/validaciones/validador-turno';
import { ValidadorCierre } from '../domain/cierre/validador-cierre';
import { TransicionInvalidaError } from '../domain/errors/transicion-invalida.error';
import { ResultadoOperacion } from './resultado-operacion';

export const VALIDADOR_INASISTENCIA = 'VALIDADOR_INASISTENCIA';

// Aplica una transición atrapando las transiciones inválidas del State.
export function aplicarTransicion(
  turno: Turno,
  transicion: (t: Turno) => void,
): ResultadoOperacion<Turno> {
  try {
    transicion(turno);
    return ResultadoOperacion.ok(turno);
  } catch (e) {
    if (e instanceof TransicionInvalidaError) {
      return ResultadoOperacion.fallo([e.message]);
    }
    throw e;
  }
}

@Injectable()
export class ConfirmarTurnoUseCase {
  constructor(
    private readonly validador: ValidadorTurno,
    @Inject('ITurnoRepository') private readonly repo: ITurnoRepository,
  ) {}

  async ejecutar(turnoId: string): Promise<ResultadoOperacion<Turno> | null> {
    const turno = await this.repo.buscarPorId(turnoId);
    if (!turno) return null;

    // RN-03 / RN-13: segunda validación, la agenda pudo cambiar
    const validacion = await this.validador.validar(turno);
    if (!validacion.esValido)
      return ResultadoOperacion.fallo(validacion.errores);

    const resultado = aplicarTransicion(turno, (t) => t.confirmar());
    if (resultado.exito) await this.repo.actualizar(turno);
    return resultado;
  }
}

@Injectable()
export class CancelarTurnoUseCase {
  constructor(
    @Inject('ITurnoRepository') private readonly repo: ITurnoRepository,
  ) {}

  async ejecutar(turnoId: string): Promise<ResultadoOperacion<Turno> | null> {
    const turno = await this.repo.buscarPorId(turnoId);
    if (!turno) return null;
    const resultado = aplicarTransicion(turno, (t) => t.cancelar()); // RN-21
    if (resultado.exito) await this.repo.actualizar(turno);
    return resultado;
  }
}

@Injectable()
export class RechazarTurnoUseCase {
  constructor(
    @Inject('ITurnoRepository') private readonly repo: ITurnoRepository,
  ) {}

  async ejecutar(turnoId: string): Promise<ResultadoOperacion<Turno> | null> {
    const turno = await this.repo.buscarPorId(turnoId);
    if (!turno) return null;
    const resultado = aplicarTransicion(turno, (t) => t.rechazar()); // RN-21
    if (resultado.exito) await this.repo.actualizar(turno);
    return resultado;
  }
}

@Injectable()
export class RegistrarInasistenciaUseCase {
  constructor(
    @Inject(VALIDADOR_INASISTENCIA) private readonly validador: ValidadorCierre,
    @Inject('ITurnoRepository') private readonly repo: ITurnoRepository,
  ) {}

  async ejecutar(
    turnoId: string,
    ahora: Date = new Date(),
  ): Promise<ResultadoOperacion<Turno> | null> {
    const turno = await this.repo.buscarPorId(turnoId);
    if (!turno) return null;

    // RN-26: turno confirmado y horario alcanzado
    const validacion = this.validador.validar({ turno, ahora });
    if (!validacion.esValido)
      return ResultadoOperacion.fallo(validacion.errores);

    // RN-31: pasa a Ausente, sin cobro; la franja se libera porque
    // la superposición solo cuenta turnos PENDIENTE y CONFIRMADO.
    const resultado = aplicarTransicion(turno, (t) =>
      t.registrarInasistencia(),
    );
    if (resultado.exito) await this.repo.actualizar(turno);
    return resultado;
  }
}
