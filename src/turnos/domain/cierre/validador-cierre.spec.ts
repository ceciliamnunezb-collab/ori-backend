// Patrón Strategy: reglas de cierre del turno (RN-26, RN-27, RN-29).
import { Turno } from '../turno.entity';
import { Confirmado } from '../estados/confirmado';
import { Pendiente } from '../estados/pendiente';
import { ValidadorCierre } from './validador-cierre';
import { ReglaTurnoConfirmado } from './regla-turno-confirmado';
import { ReglaHorarioAlcanzado } from './regla-horario-alcanzado';
import { ReglaImportePositivo } from './regla-importe-positivo';
import { ReglaMedioPagoAdmitido } from './regla-medio-pago-admitido';
import { ReglaTransferenciaVerificada } from './regla-transferencia-verificada';

const ahora = new Date('2026-11-20T15:00:00');
const turno = (fecha: string, estado = new Confirmado()) =>
  new Turno({
    id: 't',
    profesionalId: 'p',
    clienteId: 'c',
    fechaHora: new Date(fecha),
    duracionMin: 60,
    estado,
  });

const validador = new ValidadorCierre([
  new ReglaTurnoConfirmado(),
  new ReglaHorarioAlcanzado(),
  new ReglaImportePositivo(),
  new ReglaMedioPagoAdmitido(),
  new ReglaTransferenciaVerificada(),
]);
const efectivo = {
  importe: 27000,
  medioPago: 'EFECTIVO',
  transferenciaVerificada: false,
};

describe('ValidadorCierre (cobro)', () => {
  it('acepta un cobro válido en efectivo', () => {
    expect(
      validador.validar({
        turno: turno('2026-11-20T14:30:00'),
        ahora,
        pago: efectivo,
      }).esValido,
    ).toBe(true);
  });

  it('rechaza un turno cuyo horario no llegó (RN-26)', () => {
    const r = validador.validar({
      turno: turno('2026-11-20T17:00:00'),
      ahora,
      pago: efectivo,
    });
    expect(r.esValido).toBe(false);
    expect(r.errores[0]).toContain('17:00');
  });

  it('rechaza un turno que no está Confirmado (RN-26)', () => {
    const r = validador.validar({
      turno: turno('2026-11-20T14:00:00', new Pendiente()),
      ahora,
      pago: efectivo,
    });
    expect(r.esValido).toBe(false);
  });

  it('rechaza importe cero o negativo (RN-29)', () => {
    const r = validador.validar({
      turno: turno('2026-11-20T14:00:00'),
      ahora,
      pago: { ...efectivo, importe: 0 },
    });
    expect(r.esValido).toBe(false);
  });

  it('rechaza medios de pago no admitidos (RN-27)', () => {
    const r = validador.validar({
      turno: turno('2026-11-20T14:00:00'),
      ahora,
      pago: { ...efectivo, medioPago: 'TARJETA' },
    });
    expect(r.esValido).toBe(false);
  });

  it('exige verificar la transferencia', () => {
    const pago = {
      importe: 1000,
      medioPago: 'TRANSFERENCIA',
      transferenciaVerificada: false,
    };
    expect(
      validador.validar({ turno: turno('2026-11-20T14:00:00'), ahora, pago })
        .esValido,
    ).toBe(false);
    expect(
      validador.validar({
        turno: turno('2026-11-20T14:00:00'),
        ahora,
        pago: { ...pago, transferenciaVerificada: true },
      }).esValido,
    ).toBe(true);
  });

  it('acumula todos los errores, no solo el primero', () => {
    const r = validador.validar({
      turno: turno('2026-11-20T17:00:00', new Pendiente()),
      ahora,
      pago: { importe: -5, medioPago: 'X', transferenciaVerificada: false },
    });
    expect(r.errores.length).toBe(4);
  });
});
