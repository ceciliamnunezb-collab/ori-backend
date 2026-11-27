// src/notificaciones/domain/puertos/notificacion-repository.port.ts
import { Notificacion } from '../notificacion.entity';
import { TipoNotificacion } from '../tipo-notificacion';
import { EstadoNotificacion } from '../estado-notificacion';

export interface FiltroNotificaciones {
  estado?: EstadoNotificacion;
  tipo?: TipoNotificacion;
  programadasHasta?: Date; // el panel muestra las que ya corresponde enviar
}

// Vista para el panel: la notificación más los datos del cliente
export interface NotificacionVista {
  id: string;
  tipo: TipoNotificacion;
  estado: EstadoNotificacion;
  mensaje: string;
  fechaProgramada: Date;
  fechaEnvio: Date | null;
  turnoId: string | null;
  cliente: { id: string; nombre: string; telefono: string };
}

export interface INotificacionRepository {
  guardar(notificacion: Notificacion): Promise<void>;
  buscarPorId(id: string): Promise<Notificacion | null>;
  actualizar(notificacion: Notificacion): Promise<void>;
  existeParaTurno(turnoId: string, tipo: TipoNotificacion): Promise<boolean>;
  listar(filtro: FiltroNotificaciones): Promise<NotificacionVista[]>;
}
