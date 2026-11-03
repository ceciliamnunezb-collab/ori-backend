// src/turnos/domain/turno.entity.ts
import { EstadoTurno } from './estados/estado-turno';
import { DetalleTurno } from './detalle-turno';

export class Turno {
  private id: string;
  private profesionalId: string;
  private clienteId: string;
  private fechaHora: Date;
  private duracionMin: number;
  private estado: EstadoTurno;
  private observaciones?: string;
  // Iteración 2
  private requiereSeguimiento: boolean;
  private detalles: DetalleTurno[];

  constructor(params: {
    id: string;
    profesionalId: string;
    clienteId: string;
    fechaHora: Date;
    duracionMin: number;
    estado: EstadoTurno;
    observaciones?: string;
    requiereSeguimiento?: boolean;
    detalles?: DetalleTurno[];
  }) {
    this.id = params.id;
    this.profesionalId = params.profesionalId;
    this.clienteId = params.clienteId;
    this.fechaHora = params.fechaHora;
    this.duracionMin = params.duracionMin;
    this.estado = params.estado;
    this.observaciones = params.observaciones;
    this.requiereSeguimiento = params.requiereSeguimiento ?? false;
    this.detalles = params.detalles ?? [];
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

  // Iteración 2 (RN-31)
  registrarInasistencia(): void {
    this.estado.registrarInasistencia(this);
  }

  // --- Métodos que los estados usan para mutar el turno ---

  cambiarEstado(nuevoEstado: EstadoTurno): void {
    this.estado = nuevoEstado;
  }

  asignarFecha(nuevaFecha: Date): void {
    this.fechaHora = nuevaFecha;
  }

  // --- Iteración 2: cierre del turno ---

  // RN-26: el turno solo puede cerrarse cuando su horario de inicio ya llegó.
  haComenzado(ahora: Date): boolean {
    return this.fechaHora.getTime() <= ahora.getTime();
  }

  // RN-22: al completar, la profesional indica si requiere seguimiento.
  indicarSeguimiento(requiere: boolean): void {
    this.requiereSeguimiento = requiere;
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

  get getClienteId(): string {
    return this.clienteId;
  }

  get getObservaciones(): string | undefined {
    return this.observaciones;
  }

  get getRequiereSeguimiento(): boolean {
    return this.requiereSeguimiento;
  }

  get getDetalles(): DetalleTurno[] {
    return [...this.detalles];
  }

  // Vista plana para respuestas HTTP (evita serializar el objeto estado).
  aVista() {
    return {
      id: this.id,
      profesionalId: this.profesionalId,
      clienteId: this.clienteId,
      fechaHora: this.fechaHora,
      duracionMin: this.duracionMin,
      estado: this.nombreEstado,
      observaciones: this.observaciones ?? null,
      requiereSeguimiento: this.requiereSeguimiento,
      servicios: this.detalles.map((d) => ({
        servicioId: d.servicioId,
        nombre: d.nombreServicio,
        duracionAplicadaMin: d.duracionAplicadaMin,
        precioAplicado: d.getPrecioAplicado,
      })),
    };
  }
}
