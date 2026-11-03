// src/turnos/domain/puertos/servicio-repository.port.ts
// Iteración 2: datos de los servicios necesarios para armar los
// detalles del turno (duración, precio de lista, días de seguimiento).
export interface DatosServicio {
  id: string;
  nombre: string;
  duracionMin: number;
  precio: number | null; // null = "a consultar"
  activo: boolean;
  diasSeguimiento: number | null;
}

export interface IServicioRepository {
  buscarPorIds(ids: string[]): Promise<DatosServicio[]>;
}
