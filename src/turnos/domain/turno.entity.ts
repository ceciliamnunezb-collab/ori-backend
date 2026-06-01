// src/turnos/domain/turno.entity.ts
import { EstadoTurno } from './estados/estado-turno';

export class Turno {
  private id: string;
  private profesionalId: string;
  private clienteId: string;
  private fechaHora: Date;
  private duracionMin: number;
  private estado: EstadoTurno;
  private observaciones?: string;

  constructor(params: {
    id: string;
    profesionalId: string;
    clienteId: string;
    fechaHora: Date;
    duracionMin: number;
    estado: EstadoTurno;
    observaciones?: string;
  }) {
    this.id = params.id;
    this.profesionalId = params.profesionalId;
    this.clienteId = params.clienteId;
    this.fechaHora = params.fechaHora;
    this.duracionMin = params.duracionMin;
    this.estado = params.estado;
    this.observaciones = params.observaciones;
  }

  // --- Operaciones del ciclo de vida: el Turno DELEGA en su estado ---

  confirmar(): void {
    this.estado.confirmar(this);
  }

  reprogramar(nuevaFecha: Date): void {
    this.estado.reprogramar(this, nuevaFecha);
  }

  cancelar(): void {
    this.estado.cancelar(this);
  }

  rechazar(): void {
    this.estado.rechazar(this);
  }

  completar(): void {
    this.estado.completar(this);
  }

  // --- Métodos que los estados usan para mutar el turno ---

  cambiarEstado(nuevoEstado: EstadoTurno): void {
    this.estado = nuevoEstado;
  }

  asignarFecha(nuevaFecha: Date): void {
    this.fechaHora = nuevaFecha;
  }

  // --- Getters de lectura ---

  get nombreEstado(): string {
    return this.estado.nombre();
  }

  get getId(): string {
    return this.id;
  }

  get getProfesionalId(): string {
    return this.profesionalId;
  }

  get getFechaHora(): Date {
    return this.fechaHora;
  }

  get getDuracionMin(): number {
    return this.duracionMin;
  }

}