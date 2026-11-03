// Patrón State: transiciones del ciclo de vida (RN-01), incluido Ausente.
import { Turno } from '../turno.entity';
import { Confirmado } from './confirmado';
import { Pendiente } from './pendiente';
import { TransicionInvalidaError } from '../errors/transicion-invalida.error';
import { EstadoTurno } from './estado-turno';

const turnoEn = (estado: EstadoTurno) =>
  new Turno({
    id: 't1',
    profesionalId: 'p',
    clienteId: 'c',
    fechaHora: new Date(),
    duracionMin: 60,
    estado,
  });

describe('Ciclo de vida del turno (State)', () => {
  it('Confirmado -> Completado al completar', () => {
    const t = turnoEn(new Confirmado());
    t.completar();
    expect(t.nombreEstado).toBe('COMPLETADO');
  });

  it('Confirmado -> Ausente al registrar inasistencia (RN-31)', () => {
    const t = turnoEn(new Confirmado());
    t.registrarInasistencia();
    expect(t.nombreEstado).toBe('AUSENTE');
  });

  it('Pendiente no admite inasistencia ni completar', () => {
    const t = turnoEn(new Pendiente());
    expect(() => t.registrarInasistencia()).toThrow(TransicionInvalidaError);
    expect(() => t.completar()).toThrow(TransicionInvalidaError);
  });

  it('Completado no admite cambios (RN-30)', () => {
    const t = turnoEn(new Confirmado());
    t.completar();
    expect(() => t.cancelar()).toThrow(TransicionInvalidaError);
    expect(() => t.reprogramar(new Date())).toThrow(TransicionInvalidaError);
    expect(() => t.registrarInasistencia()).toThrow(TransicionInvalidaError);
  });

  it('Ausente es un estado final', () => {
    const t = turnoEn(new Confirmado());
    t.registrarInasistencia();
    expect(() => t.completar()).toThrow(TransicionInvalidaError);
    expect(() => t.confirmar()).toThrow(TransicionInvalidaError);
  });
});
