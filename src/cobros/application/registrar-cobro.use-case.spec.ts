import { RegistrarCobroUseCase } from './registrar-cobro.use-case';
import { Turno } from '../../turnos/domain/turno.entity';
import { Confirmado } from '../../turnos/domain/estados/confirmado';
import { DetalleTurno } from '../../turnos/domain/detalle-turno';
import { ITurnoRepository } from '../../turnos/domain/puertos/turno-repository.port';
import { ValidadorCierre } from '../../turnos/domain/cierre/validador-cierre';
import { ReglaTurnoConfirmado } from '../../turnos/domain/cierre/regla-turno-confirmado';
import { ReglaHorarioAlcanzado } from '../../turnos/domain/cierre/regla-horario-alcanzado';
import { ReglaImportePositivo } from '../../turnos/domain/cierre/regla-importe-positivo';
import { ReglaMedioPagoAdmitido } from '../../turnos/domain/cierre/regla-medio-pago-admitido';
import { ReglaTransferenciaVerificada } from '../../turnos/domain/cierre/regla-transferencia-verificada';
import { ICobroRepository } from '../domain/puertos/cobro-repository.port';
import { GenerarSeguimientoService } from '../../notificaciones/application/generar-seguimiento.service';
import { IDatosNotificacionRepository } from '../../notificaciones/domain/puertos/datos-notificacion.port';
import { Cobro } from '../domain/cobro.entity';
import { Notificacion } from '../../notificaciones/domain/notificacion.entity';

const ahora = new Date('2026-11-20T15:30:00');

function armar(turno: Turno | null) {
  const cierres: {
    cobro: Cobro;
    turno: Turno;
    seguimiento: Notificacion | null;
  }[] = [];
  const turnos: ITurnoRepository = {
    guardar: async () => {},
    buscarSolapados: async () => [],
    actualizar: async () => {},
    buscarConfirmadosEntre: async () => [],
    buscarPorId: async () => turno,
  };
  const cobros: ICobroRepository = {
    registrarCierre: async (cobro, t, seguimiento) => {
      cierres.push({ cobro, turno: t, seguimiento });
    },
    listarPorPeriodo: async () => [],
  };
  const datos: IDatosNotificacionRepository = {
    buscarCliente: async () => ({
      id: 'c',
      nombre: 'Valentina',
      telefono: '+5493411234567',
    }),
    plantilla: async () => '¡Hola {nombre}! ¿Cómo te fue con tu {servicios}?',
    horasAntesRecordatorio: async () => 24,
  };
  const validador = new ValidadorCierre([
    new ReglaTurnoConfirmado(),
    new ReglaHorarioAlcanzado(),
    new ReglaImportePositivo(),
    new ReglaMedioPagoAdmitido(),
    new ReglaTransferenciaVerificada(),
  ]);
  const uc = new RegistrarCobroUseCase(
    turnos,
    cobros,
    validador,
    new GenerarSeguimientoService(datos),
  );
  return { uc, cierres };
}

const turnoConfirmado = () =>
  new Turno({
    id: 't1',
    profesionalId: 'p',
    clienteId: 'c',
    fechaHora: new Date('2026-11-20T14:30:00'),
    duracionMin: 70,
    estado: new Confirmado(),
    detalles: [
      new DetalleTurno('s1', 'Corte', 40, 15000, null),
      new DetalleTurno('s2', 'Peinado', 30, null, 20),
    ],
  });

describe('RegistrarCobroUseCase (ECU-02)', () => {
  it('flujo normal: registra el cobro, completa el turno y genera el seguimiento', async () => {
    const { uc, cierres } = armar(turnoConfirmado());
    const r = await uc.ejecutar(
      {
        turnoId: 't1',
        importe: 27000,
        medioPago: 'EFECTIVO',
        preciosInformados: [{ servicioId: 's2', precio: 12000 }],
        requiereSeguimiento: true,
      },
      ahora,
    );

    expect(r?.exito).toBe(true);
    expect(r?.valor?.cobro.getImporteSugerido).toBe(27000);
    expect(r?.valor?.turno.nombreEstado).toBe('COMPLETADO');
    expect(r?.valor?.seguimiento?.getMensaje).toBe(
      '¡Hola Valentina! ¿Cómo te fue con tu Corte y Peinado?',
    );
    // programado a los 20 días (el mayor configurado entre los servicios)
    expect(r?.valor?.seguimiento?.getFechaProgramada.getTime()).toBe(
      ahora.getTime() + 20 * 86_400_000,
    );
    expect(cierres).toHaveLength(1);
  });

  it('sin seguimiento indicado no genera notificación', async () => {
    const { uc } = armar(turnoConfirmado());
    const r = await uc.ejecutar(
      { turnoId: 't1', importe: 27000, medioPago: 'EFECTIVO' },
      ahora,
    );
    expect(r?.valor?.seguimiento).toBeNull();
  });

  it('turno inexistente -> null (404)', async () => {
    const { uc } = armar(null);
    expect(
      await uc.ejecutar(
        { turnoId: 'x', importe: 1, medioPago: 'EFECTIVO' },
        ahora,
      ),
    ).toBeNull();
  });

  it('validación fallida -> no persiste nada', async () => {
    const { uc, cierres } = armar(turnoConfirmado());
    const r = await uc.ejecutar(
      { turnoId: 't1', importe: 0, medioPago: 'EFECTIVO' },
      ahora,
    );
    expect(r?.exito).toBe(false);
    expect(cierres).toHaveLength(0);
  });

  it('un turno ya completado no se puede volver a cobrar (RN-30)', async () => {
    const t = turnoConfirmado();
    t.completar();
    const { uc } = armar(t);
    const r = await uc.ejecutar(
      { turnoId: 't1', importe: 1000, medioPago: 'EFECTIVO' },
      ahora,
    );
    expect(r?.exito).toBe(false);
  });
});
