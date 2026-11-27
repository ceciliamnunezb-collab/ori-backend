// src/turnos/domain/puertos/turno-repository.port.ts
import { Turno } from '../turno.entity';

export interface ITurnoRepository {
  guardar(turno: Turno): Promise<void>;
  buscarSolapados(
    profesionalId: string,
    fechaHora: Date,
    duracionMin: number,
    excluirTurnoId?: string, // al confirmar, el propio turno no cuenta
  ): Promise<Turno[]>;
  // Iteración 2
  buscarPorId(id: string): Promise<Turno | null>;
  actualizar(turno: Turno): Promise<void>;
  buscarConfirmadosEntre(desde: Date, hasta: Date): Promise<Turno[]>;
}
