// src/notificaciones/application/generar-recordatorios.use-case.ts
// RN-06 / RF-08.1: detecta los turnos confirmados próximos y genera
// su recordatorio pre-cargado en estado Pendiente.
// Lo dispara el Reloj del sistema (actor temporal) o la profesional a mano.
import { Inject, Injectable } from '@nestjs/common';
import type { ITurnoRepository } from '../../turnos/domain/puertos/turno-repository.port';
import type { INotificacionRepository } from '../domain/puertos/notificacion-repository.port';
import type { IDatosNotificacionRepository } from '../domain/puertos/datos-notificacion.port';
import { NotificacionFactory } from '../domain/notificacion.factory';
import { TipoNotificacion } from '../domain/tipo-notificacion';
import { Notificacion } from '../domain/notificacion.entity';

// Ventana máxima a mirar hacia adelante; luego se filtra por la
// anticipación configurada de cada profesional.
const HORAS_MAXIMAS = 72;

@Injectable()
export class GenerarRecordatoriosUseCase {
  constructor(
    @Inject('ITurnoRepository') private readonly turnos: ITurnoRepository,
    @Inject('INotificacionRepository')
    private readonly notificaciones: INotificacionRepository,
    @Inject('IDatosNotificacionRepository')
    private readonly datos: IDatosNotificacionRepository,
  ) {}

  async ejecutar(ahora: Date = new Date()): Promise<Notificacion[]> {
    const hasta = new Date(ahora.getTime() + HORAS_MAXIMAS * 3_600_000);
    const proximos = await this.turnos.buscarConfirmadosEntre(ahora, hasta);
    const plantilla = await this.datos.plantilla(TipoNotificacion.RECORDATORIO);
    const generadas: Notificacion[] = [];

    for (const turno of proximos) {
      const horasAntes = await this.datos.horasAntesRecordatorio(
        turno.getProfesionalId,
      );
      const limite = new Date(ahora.getTime() + horasAntes * 3_600_000);
      if (turno.getFechaHora > limite) continue; // todavía no corresponde

      // Un turno tiene un solo recordatorio (idempotente si el reloj corre varias veces)
      if (
        await this.notificaciones.existeParaTurno(
          turno.getId,
          TipoNotificacion.RECORDATORIO,
        )
      ) {
        continue;
      }

      const cliente = await this.datos.buscarCliente(turno.getClienteId);
      if (!cliente) continue;

      const notificacion = NotificacionFactory.recordatorio(
        {
          turnoId: turno.getId,
          clienteId: cliente.id,
          nombreCliente: cliente.nombre,
          fechaHoraTurno: turno.getFechaHora,
          servicios: turno.getDetalles.map((d) => d.nombreServicio),
        },
        plantilla,
        horasAntes,
        ahora,
      );
      await this.notificaciones.guardar(notificacion);
      generadas.push(notificacion);
    }
    return generadas;
  }
}
