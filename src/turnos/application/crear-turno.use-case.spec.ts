// Reemplaza al script temporal prueba-use-case.ts: los mismos 3 casos
// de la Iteración 1, ahora como pruebas automáticas, más el multi-servicio.
import { CrearTurnoUseCase } from './crear-turno.use-case';
import { CrearTurnoCommand } from './crear-turno.command';
import { ValidadorTurno } from '../domain/validaciones/validador-turno';
import { ReglaFechaNoPasada } from '../domain/validaciones/regla-fecha-no-pasada';
import { ReglaVentanaReserva } from '../domain/validaciones/regla-ventana-reserva';
import { ReglaSuperposicion } from '../domain/validaciones/regla-superposicion';
import { Turno } from '../domain/turno.entity';
import { ITurnoRepository } from '../domain/puertos/turno-repository.port';
import {
  IServicioRepository,
  DatosServicio,
} from '../domain/puertos/servicio-repository.port';

class TurnoRepoMock implements ITurnoRepository {
  public guardados: Turno[] = [];
  constructor(private solapados: Turno[] = []) {}
  async guardar(turno: Turno) {
    this.guardados.push(turno);
  }
  async buscarSolapados() {
    return this.solapados;
  }
  async buscarPorId() {
    return null;
  }
  async actualizar() {}
  async buscarConfirmadosEntre() {
    return [];
  }
}

class ServicioRepoMock implements IServicioRepository {
  constructor(private servicios: DatosServicio[] = []) {}
  async buscarPorIds(ids: string[]) {
    return this.servicios.filter((s) => ids.includes(s.id));
  }
}

function fechaValida(): Date {
  const f = new Date();
  f.setDate(f.getDate() + 5);
  f.setHours(14, 0, 0, 0);
  return f;
}

const base: CrearTurnoCommand = {
  origen: 'cliente',
  profesionalId: 'debi-001',
  clienteId: 'cliente-001',
  fechaHora: fechaValida(),
  duracionMin: 60,
};

describe('CrearTurnoUseCase', () => {
  it('CASO 1: desde el cliente nace PENDIENTE y se guarda', async () => {
    const repo = new TurnoRepoMock();
    const validador = new ValidadorTurno([
      new ReglaFechaNoPasada(),
      new ReglaVentanaReserva(30),
      new ReglaSuperposicion(repo, 2),
    ]);
    const r = await new CrearTurnoUseCase(
      validador,
      repo,
      new ServicioRepoMock(),
    ).ejecutar(base);
    expect(r.exito).toBe(true);
    expect(r.valor?.nombreEstado).toBe('PENDIENTE');
    expect(repo.guardados).toHaveLength(1);
  });

  it('CASO 2: desde la profesional nace CONFIRMADO', async () => {
    const repo = new TurnoRepoMock();
    const uc = new CrearTurnoUseCase(
      new ValidadorTurno([new ReglaFechaNoPasada()]),
      repo,
      new ServicioRepoMock(),
    );
    const r = await uc.ejecutar({ ...base, origen: 'profesional' });
    expect(r.valor?.nombreEstado).toBe('CONFIRMADO');
  });

  it('CASO 3: fecha pasada -> falla y NO se guarda', async () => {
    const repo = new TurnoRepoMock();
    const uc = new CrearTurnoUseCase(
      new ValidadorTurno([new ReglaFechaNoPasada()]),
      repo,
      new ServicioRepoMock(),
    );
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const r = await uc.ejecutar({ ...base, fechaHora: ayer });
    expect(r.exito).toBe(false);
    expect(repo.guardados).toHaveLength(0);
  });

  it('multi-servicio: la duración es la suma de los servicios (RN-14)', async () => {
    const repo = new TurnoRepoMock();
    const servicios = new ServicioRepoMock([
      {
        id: 's1',
        nombre: 'Corte',
        duracionMin: 40,
        precio: 15000,
        activo: true,
        diasSeguimiento: null,
      },
      {
        id: 's2',
        nombre: 'Peinado',
        duracionMin: 30,
        precio: null,
        activo: true,
        diasSeguimiento: null,
      },
    ]);
    const uc = new CrearTurnoUseCase(new ValidadorTurno([]), repo, servicios);
    const r = await uc.ejecutar({ ...base, servicioIds: ['s1', 's2'] });
    expect(r.valor?.getDuracionMin).toBe(70);
    expect(r.valor?.getDetalles).toHaveLength(2);
  });

  it('multi-servicio: rechaza servicios inexistentes', async () => {
    const uc = new CrearTurnoUseCase(
      new ValidadorTurno([]),
      new TurnoRepoMock(),
      new ServicioRepoMock(),
    );
    const r = await uc.ejecutar({ ...base, servicioIds: ['no-existe'] });
    expect(r.exito).toBe(false);
  });
});
