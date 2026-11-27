// src/notificaciones/application/enviar-notificacion.use-case.ts
// RF-08.4 / RF-08.5: la profesional envía con un clic. El sistema devuelve
// el enlace de WhatsApp con el mensaje y registra la notificación como Enviada.
import { Inject, Injectable } from '@nestjs/common';
import type { INotificacionRepository } from '../domain/puertos/notificacion-repository.port';
import type { IDatosNotificacionRepository } from '../domain/puertos/datos-notificacion.port';
import type { IMensajePort } from '../domain/puertos/mensaje.port';
import { NotificacionYaEnviadaError } from '../domain/notificacion-ya-enviada.error';
import { ResultadoOperacion } from '../../turnos/application/resultado-operacion';
import { Notificacion } from '../domain/notificacion.entity';

export interface NotificacionEnviada {
  notificacion: Notificacion;
  enlace: string;
}

@Injectable()
export class EnviarNotificacionUseCase {
  constructor(
    @Inject('INotificacionRepository')
    private readonly repo: INotificacionRepository,
    @Inject('IDatosNotificacionRepository')
    private readonly datos: IDatosNotificacionRepository,
    @Inject('IMensajePort') private readonly mensajes: IMensajePort,
  ) {}

  async ejecutar(
    id: string,
    mensajeEditado?: string,
    ahora: Date = new Date(),
  ): Promise<ResultadoOperacion<NotificacionEnviada> | null> {
    const notificacion = await this.repo.buscarPorId(id);
    if (!notificacion) return null;

    const cliente = await this.datos.buscarCliente(notificacion.getClienteId);
    if (!cliente)
      return ResultadoOperacion.fallo([
        'El cliente de la notificación no existe.',
      ]);

    try {
      if (mensajeEditado !== undefined)
        notificacion.editarMensaje(mensajeEditado);
      notificacion.marcarEnviada(ahora);
    } catch (e) {
      if (e instanceof NotificacionYaEnviadaError || e instanceof Error) {
        return ResultadoOperacion.fallo([e.message]);
      }
      throw e;
    }

    await this.repo.actualizar(notificacion);
    const enlace = this.mensajes.generarEnlace(
      cliente.telefono,
      notificacion.getMensaje,
    );
    return ResultadoOperacion.ok({ notificacion, enlace });
  }
}
