import { CalculadorImporte } from './calculador-importe';
import { DetalleTurno } from '../../turnos/domain/detalle-turno';

const corte = () => new DetalleTurno('s1', 'Corte', 40, 15000, null);
const peinado = () => new DetalleTurno('s2', 'Peinado', 30, null, null); // "a consultar"

describe('CalculadorImporte (RN-29)', () => {
  it('suma los precios de lista', () => {
    const d = [corte(), new DetalleTurno('s3', 'Color', 90, 30000, 20)];
    expect(CalculadorImporte.sugerir(d).importeSugerido).toBe(45000);
    expect(d[0].getPrecioAplicado).toBe(15000);
  });

  it('usa el precio informado para servicios "a consultar"', () => {
    const d = [corte(), peinado()];
    const r = CalculadorImporte.sugerir(d, [
      { servicioId: 's2', precio: 12000 },
    ]);
    expect(r.importeSugerido).toBe(27000);
    expect(d[1].getPrecioAplicado).toBe(12000);
  });

  it('sin precio para un servicio "a consultar" no hay sugerido', () => {
    const r = CalculadorImporte.sugerir([corte(), peinado()]);
    expect(r.importeSugerido).toBeNull();
    expect(r.serviciosSinPrecio).toEqual(['Peinado']);
  });

  it('un turno sin servicios cargados no tiene sugerido', () => {
    expect(CalculadorImporte.sugerir([]).importeSugerido).toBeNull();
  });
});
