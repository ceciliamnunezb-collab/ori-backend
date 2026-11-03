// src/turnos/application/prueba-use-case.ts  (temporal)
import { CrearTurnoUseCase } from './crear-turno.use-case';
import { CrearTurnoCommand } from './crear-turno.command';
import { ValidadorTurno } from '../domain/validaciones/validador-turno';
import { ReglaFechaNoPasada } from '../domain/validaciones/regla-fecha-no-pasada';
import { ReglaVentanaReserva } from '../domain/validaciones/regla-ventana-reserva';
import { ReglaSuperposicion } from '../domain/validaciones/regla-superposicion';
import { Turno } from '../domain/turno.entity';
import { ITurnoRepository } from '../domain/puertos/turno-repository.port';

// ---- Mock del repositorio que ADEMÁS registra lo que se guardó ----
class TurnoRepoMock implements ITurnoRepository {
  public guardados: Turno[] = []; // acá anotamos lo que se guarda

  constructor(private solapados: Turno[] = []) {}

  async guardar(turno: Turno): Promise<void> {
    this.guardados.push(turno); // registramos el guardado
  }

  async buscarSolapados(): Promise<Turno[]> {
    return this.solapados;
  }
}

// ---- Helper: fecha válida (dentro de 5 días, 14:00) ----
function fechaValida(): Date {
  const f = new Date();
  f.setDate(f.getDate() + 5);
  f.setHours(14, 0, 0, 0);
  return f;
}

async function correr() {
  // CASO 1: creación exitosa desde cliente
  const repo1 = new TurnoRepoMock([]);
  const validador1 = new ValidadorTurno([
    new ReglaFechaNoPasada(),
    new ReglaVentanaReserva(30),
    new ReglaSuperposicion(repo1, 2),
  ]);
  const useCase1 = new CrearTurnoUseCase(validador1, repo1);

  const cmd1: CrearTurnoCommand = {
    origen: 'cliente',
    profesionalId: 'debi-001',
    clienteId: 'cliente-001',
    fechaHora: fechaValida(),
    duracionMin: 60,
  };

  const resultado1 = await useCase1.ejecutar(cmd1);
  console.log('--- CASO 1: cliente, turno válido ---');
  console.log('Éxito:', resultado1.exito);
  console.log('Estado del turno:', resultado1.valor?.nombreEstado); // PENDIENTE
  console.log('¿Se guardó en el repo?', repo1.guardados.length === 1);

  // CASO 2: creación desde profesional
  const repo2 = new TurnoRepoMock([]);
  const validador2 = new ValidadorTurno([new ReglaFechaNoPasada()]);
  const useCase2 = new CrearTurnoUseCase(validador2, repo2);

  const resultado2 = await useCase2.ejecutar({ ...cmd1, origen: 'profesional' });
  console.log('\n--- CASO 2: profesional, turno válido ---');
  console.log('Éxito:', resultado2.exito);
  console.log('Estado del turno:', resultado2.valor?.nombreEstado); // CONFIRMADO

  // CASO 3: validación falla (fecha pasada) -> NO se guarda
  const repo3 = new TurnoRepoMock([]);
  const validador3 = new ValidadorTurno([new ReglaFechaNoPasada()]);
  const useCase3 = new CrearTurnoUseCase(validador3, repo3);

  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);

  const resultado3 = await useCase3.ejecutar({ ...cmd1, fechaHora: ayer });
  console.log('\n--- CASO 3: fecha pasada, debe fallar ---');
  console.log('Éxito:', resultado3.exito);
  console.log('Errores:', resultado3.errores);
  console.log('¿NO se guardó?', repo3.guardados.length === 0);
}

correr();