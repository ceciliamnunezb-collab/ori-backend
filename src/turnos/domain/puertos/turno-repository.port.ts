// src/turnos/domain/puertos/turno-repository.port.ts
import { Turno } from '../turno.entity';

export interface ITurnoRepository {
  guardar(turno: Turno): Promise<void>;
  buscarSolapados(fechaHora: Date, duracionMin: number): Promise<Turno[]>;
}