// src/notificaciones/infrastructure/mapa-notificacion.ts
// Traductores entre filas de Prisma y la entidad Notificacion.
import {
  Notificacion as NotificacionPrisma,
  TipoNotificacion as TipoPrisma,
} from '@prisma/client';
import { Notificacion } from '../domain/notificacion.entity';
import { TipoNotificacion } from '../domain/tipo-notificacion';
import { EstadoNotificacion } from '../domain/estado-notificacion';

export function notificacionToDomain(
  fila: NotificacionPrisma & { tipoNotificacion: TipoPrisma },
): Notificacion {
  return new Notificacion(
    fila.id,
    fila.clienteId,
    fila.turnoId,
    fila.tipoNotificacion.codigo as TipoNotificacion,
    fila.mensaje,
    fila.estado as EstadoNotificacion,
    fila.fechaGenerada,
    fila.fechaProgramada,
    fila.fechaEnvio,
  );
}

// Datos para crear la fila; el tipo se conecta por su código único.
export function notificacionToCreate(n: Notificacion) {
  return {
    id: n.getId,
    cliente: { connect: { id: n.getClienteId } },
    ...(n.getTurnoId ? { turno: { connect: { id: n.getTurnoId } } } : {}),
    tipoNotificacion: { connect: { codigo: n.getTipo } },
    mensaje: n.getMensaje,
    estado: n.getEstado,
    fechaGenerada: n.getFechaGenerada,
    fechaProgramada: n.getFechaProgramada,
    fechaEnvio: n.getFechaEnvio,
  };
}
