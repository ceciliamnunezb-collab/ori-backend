// src/notificaciones/domain/notificacion.factory.ts
// Patrón Factory Method: encapsula cómo nace cada tipo de notificación
// (su fecha programada y su mensaje), igual que TurnoFactory decide
// el estado inicial del turno según su origen.
import { randomUUID } from 'crypto';
import { Notificacion } from './notificacion.entity';
import { TipoNotificacion } from './tipo-notificacion';
import { EstadoNotificacion } from './estado-notificacion';
import { PlantillaMensaje } from './plantilla-mensaje';

export const DIAS_SEGUIMIENTO_POR_DEFECTO = 30;

export interface DatosTurnoNotificable {
  turnoId: string;
  clienteId: string;
  nombreCliente: string;
  fechaHoraTurno: Date;
  servicios: string[];
}

export class NotificacionFactory {
  // RN-06: recordatorio programado X horas antes del turno.
  static recordatorio(
    datos: DatosTurnoNotificable,
    plantilla: string,
    horasAntes: number,
    ahora: Date,
  ): Notificacion {
    const programada = new Date(
      datos.fechaHoraTurno.getTime() - horasAntes * 3_600_000,
    );
    const mensaje = PlantillaMensaje.completar(plantilla, {
      nombre: datos.nombreCliente,
      fecha: PlantillaMensaje.fecha(datos.fechaHoraTurno),
      hora: PlantillaMensaje.hora(datos.fechaHoraTurno),
      servicios: PlantillaMensaje.servicios(datos.servicios),
    });
    return NotificacionFactory.nueva(
      datos,
      TipoNotificacion.RECORDATORIO,
      mensaje,
      ahora,
      programada,
    );
  }

  // RN-07: seguimiento programado los días configurados después del cobro.
  static seguimiento(
    datos: DatosTurnoNotificable,
    plantilla: string,
    dias: number | null,
    ahora: Date,
  ): Notificacion {
    const diasEfectivos = dias ?? DIAS_SEGUIMIENTO_POR_DEFECTO;
    const programada = new Date(ahora.getTime() + diasEfectivos * 86_400_000);
    const mensaje = PlantillaMensaje.completar(plantilla, {
      nombre: datos.nombreCliente,
      servicios: PlantillaMensaje.servicios(datos.servicios),
    });
    return NotificacionFactory.nueva(
      datos,
      TipoNotificacion.SEGUIMIENTO,
      mensaje,
      ahora,
      programada,
    );
  }

  private static nueva(
    datos: DatosTurnoNotificable,
    tipo: TipoNotificacion,
    mensaje: string,
    ahora: Date,
    programada: Date,
  ): Notificacion {
    return new Notificacion(
      randomUUID(),
      datos.clienteId,
      datos.turnoId,
      tipo,
      mensaje,
      EstadoNotificacion.PENDIENTE,
      ahora,
      programada,
    );
  }
}
