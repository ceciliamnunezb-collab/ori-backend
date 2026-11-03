// src/notificaciones/application/listar-notificaciones.use-case.ts
// RF-08.3: panel de notificaciones agrupadas por tipo.
import { Inject, Injectable } from '@nestjs/common';
import type {
  FiltroNotificaciones,
  INotificacionRepository,
  NotificacionVista,
} from '../domain/puertos/notificacion-repository.port';

@Injectable()
export class ListarNotificacionesUseCase {
  constructor(
    @Inject('INotificacionRepository')
    private readonly repo: INotificacionRepository,
  ) {}

  async ejecutar(
    filtro: FiltroNotificaciones,
  ): Promise<Record<string, NotificacionVista[]>> {
    const lista = await this.repo.listar(filtro);
    const porTipo: Record<string, NotificacionVista[]> = {};
    for (const n of lista) {
      (porTipo[n.tipo] ??= []).push(n);
    }
    return porTipo;
  }
}
