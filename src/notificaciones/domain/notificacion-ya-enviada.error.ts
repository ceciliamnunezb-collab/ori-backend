// src/notificaciones/domain/notificacion-ya-enviada.error.ts
export class NotificacionYaEnviadaError extends Error {
  constructor() {
    super('La notificación ya fue enviada y no se puede modificar.');
    this.name = 'NotificacionYaEnviadaError';
  }
}
