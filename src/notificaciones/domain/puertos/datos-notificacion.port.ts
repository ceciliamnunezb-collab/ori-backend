// src/notificaciones/domain/puertos/datos-notificacion.port.ts
// Datos de lectura que las notificaciones necesitan de otros módulos.
import { TipoNotificacion } from '../tipo-notificacion';

export interface DatosCliente {
  id: string;
  nombre: string;
  telefono: string;
}

export interface IDatosNotificacionRepository {
  buscarCliente(clienteId: string): Promise<DatosCliente | null>;
  plantilla(tipo: TipoNotificacion): Promise<string>;
  horasAntesRecordatorio(profesionalId: string): Promise<number>; // RN-06
}
