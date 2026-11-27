// src/notificaciones/domain/notificacion.entity.ts
// Mensaje pre-cargado que genera el sistema y envía la profesional
// por WhatsApp con un clic (esquema híbrido, RE-05).
import { TipoNotificacion } from './tipo-notificacion';
import { EstadoNotificacion } from './estado-notificacion';
import { NotificacionYaEnviadaError } from './notificacion-ya-enviada.error';

export class Notificacion {
  constructor(
    private readonly id: string,
    private readonly clienteId: string,
    private readonly turnoId: string | null, // null en saludos de cumpleaños
    private readonly tipo: TipoNotificacion,
    private mensaje: string,
    private estado: EstadoNotificacion,
    private readonly fechaGenerada: Date,
    private readonly fechaProgramada: Date,
    private fechaEnvio: Date | null = null,
  ) {}

  // La profesional puede ajustar el texto antes de enviarlo («extend» Editar Mensaje).
  editarMensaje(texto: string): void {
    this.exigirPendiente();
    if (!texto || texto.trim().length === 0) {
      throw new Error('El mensaje no puede quedar vacío.');
    }
    this.mensaje = texto.trim();
  }

  // RF-08.5: al enviarla queda registrada como Enviada.
  marcarEnviada(ahora: Date): void {
    this.exigirPendiente();
    this.estado = EstadoNotificacion.ENVIADA;
    this.fechaEnvio = ahora;
  }

  private exigirPendiente(): void {
    if (this.estado !== EstadoNotificacion.PENDIENTE) {
      throw new NotificacionYaEnviadaError();
    }
  }

  get getId(): string {
    return this.id;
  }
  get getClienteId(): string {
    return this.clienteId;
  }
  get getTurnoId(): string | null {
    return this.turnoId;
  }
  get getTipo(): TipoNotificacion {
    return this.tipo;
  }
  get getMensaje(): string {
    return this.mensaje;
  }
  get getEstado(): EstadoNotificacion {
    return this.estado;
  }
  get getFechaGenerada(): Date {
    return this.fechaGenerada;
  }
  get getFechaProgramada(): Date {
    return this.fechaProgramada;
  }
  get getFechaEnvio(): Date | null {
    return this.fechaEnvio;
  }

  aVista() {
    return {
      id: this.id,
      tipo: this.tipo,
      estado: this.estado,
      clienteId: this.clienteId,
      turnoId: this.turnoId,
      mensaje: this.mensaje,
      fechaGenerada: this.fechaGenerada,
      fechaProgramada: this.fechaProgramada,
      fechaEnvio: this.fechaEnvio,
    };
  }
}
