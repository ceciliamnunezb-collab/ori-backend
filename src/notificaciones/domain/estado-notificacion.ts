// src/notificaciones/domain/estado-notificacion.ts
// RF-08.5: una notificación está Pendiente hasta que la profesional la envía.
export enum EstadoNotificacion {
  PENDIENTE = 'PENDIENTE',
  ENVIADA = 'ENVIADA',
}
