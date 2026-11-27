// src/notificaciones/application/generar-seguimiento.service.ts
// RN-07 / RN-22: cuando un turno se completa y requiere seguimiento,
// arma la notificación de seguimiento (no la persiste: la persiste
// el cierre del turno dentro de la misma transacción que el cobro).
import { Inject, Injectable } from '@nestjs/common';
import type { IDatosNotificacionRepository } from '../domain/puertos/datos-notificacion.port';
import { NotificacionFactory } from '../domain/notificacion.factory';
import { TipoNotificacion } from '../domain/tipo-notificacion';
import { Notificacion } from '../domain/notificacion.entity';
import { Turno } from '../../turnos/domain/turno.entity';

@Injectable()
export class GenerarSeguimientoService {
  constructor(
    @Inject('IDatosNotificacionRepository')
    private readonly datos: IDatosNotificacionRepository,
  ) {}

  async paraTurno(turno: Turno, ahora: Date): Promise<Notificacion | null> {
    if (!turno.getRequiereSeguimiento) return null;
    const cliente = await this.datos.buscarCliente(turno.getClienteId);
    if (!cliente) return null;
    const plantilla = await this.datos.plantilla(TipoNotificacion.SEGUIMIENTO);

    // Si hay varios servicios, el seguimiento se programa según el que
    // tenga más días configurados (RF-01.3).
    const dias = turno.getDetalles
      .map((d) => d.diasSeguimiento)
      .filter((d): d is number => d !== null);
    const diasSeguimiento = dias.length > 0 ? Math.max(...dias) : null;

    return NotificacionFactory.seguimiento(
      {
        turnoId: turno.getId,
        clienteId: cliente.id,
        nombreCliente: cliente.nombre,
        fechaHoraTurno: turno.getFechaHora,
        servicios: turno.getDetalles.map((d) => d.nombreServicio),
      },
      plantilla,
      diasSeguimiento,
      ahora,
    );
  }
}
