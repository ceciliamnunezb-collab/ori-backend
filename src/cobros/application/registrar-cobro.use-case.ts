// src/cobros/application/registrar-cobro.use-case.ts
// Caso de uso CORE de la Iteración 2 (ECU-02 Registrar Cobro del Turno).
import { Inject, Injectable } from '@nestjs/common';
import type { ITurnoRepository } from '../../turnos/domain/puertos/turno-repository.port';
import { ValidadorCierre } from '../../turnos/domain/cierre/validador-cierre';
import { aplicarTransicion } from '../../turnos/application/transiciones-turno.use-case';
import { ResultadoOperacion } from '../../turnos/application/resultado-operacion';
import { Turno } from '../../turnos/domain/turno.entity';
import { GenerarSeguimientoService } from '../../notificaciones/application/generar-seguimiento.service';
import { Notificacion } from '../../notificaciones/domain/notificacion.entity';
import type { ICobroRepository } from '../domain/puertos/cobro-repository.port';
import { CalculadorImporte } from '../domain/calculador-importe';
import { Cobro } from '../domain/cobro.entity';
import { MedioPago } from '../domain/medio-pago';
import { RegistrarCobroCommand } from './registrar-cobro.command';

export const VALIDADOR_COBRO = 'VALIDADOR_COBRO';

export interface CierreRegistrado {
  cobro: Cobro;
  turno: Turno;
  seguimiento: Notificacion | null;
}

@Injectable()
export class RegistrarCobroUseCase {
  constructor(
    @Inject('ITurnoRepository') private readonly turnos: ITurnoRepository,
    @Inject('ICobroRepository') private readonly cobros: ICobroRepository,
    @Inject(VALIDADOR_COBRO) private readonly validador: ValidadorCierre,
    private readonly seguimientos: GenerarSeguimientoService,
  ) {}

  async ejecutar(
    cmd: RegistrarCobroCommand,
    ahora: Date = new Date(),
  ): Promise<ResultadoOperacion<CierreRegistrado> | null> {
    // 1. Buscar el turno
    const turno = await this.turnos.buscarPorId(cmd.turnoId);
    if (!turno) return null;

    // 2. «include» Calcular Importe Sugerido (RN-29)
    const calculo = CalculadorImporte.sugerir(
      turno.getDetalles,
      cmd.preciosInformados,
    );

    // 3. «include» Validar Cierre del Turno + reglas del pago (Strategy)
    const pago = {
      importe: Number(cmd.importe),
      medioPago: cmd.medioPago,
      transferenciaVerificada: cmd.transferenciaVerificada === true,
    };
    const validacion = this.validador.validar({ turno, ahora, pago });
    if (!validacion.esValido)
      return ResultadoOperacion.fallo(validacion.errores);

    // 4. Registrar el cobro (RN-28: pago único al finalizar)
    const cobro = Cobro.registrar({
      turnoId: turno.getId,
      fechaHora: ahora,
      importeSugerido: calculo.importeSugerido,
      importe: pago.importe,
      medioPago: pago.medioPago as MedioPago,
      transferenciaVerificada: pago.transferenciaVerificada,
    });

    // 5. Completar el turno (State: Confirmado -> Completado, RN-30)
    turno.indicarSeguimiento(cmd.requiereSeguimiento === true);
    const transicion = aplicarTransicion(turno, (t) => t.completar());
    if (!transicion.exito) return ResultadoOperacion.fallo(transicion.errores);

    // 6. «extend» Generar Notificación de Seguimiento (RN-07, RN-22)
    const seguimiento = await this.seguimientos.paraTurno(turno, ahora);

    // 7. Persistir todo junto (transacción)
    await this.cobros.registrarCierre(cobro, turno, seguimiento);

    return ResultadoOperacion.ok({ cobro, turno, seguimiento });
  }
}
