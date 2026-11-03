// src/cobros/domain/puertos/cobro-repository.port.ts
import { Cobro } from '../cobro.entity';
import { MedioPago } from '../medio-pago';
import { Turno } from '../../../turnos/domain/turno.entity';
import { Notificacion } from '../../../notificaciones/domain/notificacion.entity';

// Vista de un cobro para la consulta (RF-11.5)
export interface CobroVista {
  id: string;
  fechaHora: Date;
  importe: number;
  medioPago: MedioPago;
  turnoId: string;
  cliente: string;
  servicios: string[];
}

export interface ICobroRepository {
  // Cierre atómico del turno: registra el cobro, completa el turno,
  // congela los precios aplicados y guarda el seguimiento si corresponde.
  registrarCierre(
    cobro: Cobro,
    turno: Turno,
    seguimiento: Notificacion | null,
  ): Promise<void>;
  listarPorPeriodo(desde: Date, hasta: Date): Promise<CobroVista[]>;
}
