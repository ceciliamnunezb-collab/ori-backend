// src/notificaciones/notificaciones.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { GenerarRecordatoriosUseCase } from './application/generar-recordatorios.use-case';
import { ListarNotificacionesUseCase } from './application/listar-notificaciones.use-case';
import { EnviarNotificacionUseCase } from './application/enviar-notificacion.use-case';
import { EstadoNotificacion } from './domain/estado-notificacion';
import { TipoNotificacion } from './domain/tipo-notificacion';
import { exigirExito } from '../comun/respuestas-http';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(
    private readonly generarRecordatorios: GenerarRecordatoriosUseCase,
    private readonly listarNotificaciones: ListarNotificacionesUseCase,
    private readonly enviarNotificacion: EnviarNotificacionUseCase,
  ) {}

  // GET /notificaciones?estado=PENDIENTE&tipo=RECORDATORIO&incluirFuturas=true
  // Por defecto: pendientes que ya corresponde enviar, agrupadas por tipo.
  @Get()
  async listar(
    @Query('estado') estado?: string,
    @Query('tipo') tipo?: string,
    @Query('incluirFuturas') incluirFuturas?: string,
  ) {
    const estadoFiltro = (estado ?? EstadoNotificacion.PENDIENTE).toUpperCase();
    if (
      !Object.values(EstadoNotificacion).includes(
        estadoFiltro as EstadoNotificacion,
      )
    ) {
      throw new BadRequestException({
        ok: false,
        errores: [`Estado inválido: ${estado}.`],
      });
    }
    if (
      tipo &&
      !Object.values(TipoNotificacion).includes(
        tipo.toUpperCase() as TipoNotificacion,
      )
    ) {
      throw new BadRequestException({
        ok: false,
        errores: [`Tipo inválido: ${tipo}.`],
      });
    }
    const porTipo = await this.listarNotificaciones.ejecutar({
      estado: estadoFiltro as EstadoNotificacion,
      tipo: tipo ? (tipo.toUpperCase() as TipoNotificacion) : undefined,
      programadasHasta: incluirFuturas === 'true' ? undefined : new Date(),
    });
    return { ok: true, notificaciones: porTipo };
  }

  // POST /notificaciones/recordatorios/generar — lo mismo que hace el reloj, a demanda
  @Post('recordatorios/generar')
  @HttpCode(HttpStatus.OK)
  async generar() {
    const generadas = await this.generarRecordatorios.ejecutar();
    return {
      ok: true,
      generadas: generadas.length,
      notificaciones: generadas.map((n) => n.aVista()),
    };
  }

  // POST /notificaciones/:id/enviar  { "mensaje": "texto editado (opcional)" }
  @Post(':id/enviar')
  @HttpCode(HttpStatus.OK)
  async enviar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { mensaje?: string } = {},
  ) {
    const enviada = exigirExito(
      await this.enviarNotificacion.ejecutar(id, body?.mensaje),
      'La notificación',
    );
    return {
      ok: true,
      enlace: enviada.enlace,
      notificacion: enviada.notificacion.aVista(),
    };
  }
}
