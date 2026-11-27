// src/turnos/turnos.controller.ts
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CrearTurnoUseCase } from './application/crear-turno.use-case';
import {
  CrearTurnoCommand,
  OrigenTurno,
} from './application/crear-turno.command';
import {
  CancelarTurnoUseCase,
  ConfirmarTurnoUseCase,
  RechazarTurnoUseCase,
  RegistrarInasistenciaUseCase,
} from './application/transiciones-turno.use-case';
import { exigirExito } from '../comun/respuestas-http';

// Forma del JSON que llega por HTTP. Todo lo que viaja por la red es texto:
// por eso fechaHora entra como string y se convierte a Date más abajo.
interface CrearTurnoBody {
  origen: OrigenTurno;
  profesionalId: string;
  clienteId: string;
  fechaHora: string;
  duracionMin: number;
  observaciones?: string;
  servicioIds?: string[]; // Iteración 2: multi-servicio (RN-14)
}

@Controller('turnos') // todas las rutas de este controller cuelgan de /turnos
export class TurnosController {
  constructor(
    private readonly crearTurno: CrearTurnoUseCase,
    private readonly confirmarTurno: ConfirmarTurnoUseCase,
    private readonly cancelarTurno: CancelarTurnoUseCase,
    private readonly rechazarTurno: RechazarTurnoUseCase,
    private readonly registrarInasistencia: RegistrarInasistenciaUseCase,
  ) {}

  @Post() // responde a POST /turnos
  @HttpCode(HttpStatus.CREATED) // 201 cuando sale bien
  async crear(@Body() body: CrearTurnoBody) {
    // 1. Traducir el JSON entrante a un CrearTurnoCommand.
    //    PENDIENTE (zona horaria UTC-3): este new Date() es "el borde".
    //    Acá es donde habrá que interpretar la fecha como hora de Rosario.
    const cmd: CrearTurnoCommand = {
      origen: body.origen,
      profesionalId: body.profesionalId,
      clienteId: body.clienteId,
      fechaHora: new Date(body.fechaHora),
      duracionMin: body.duracionMin,
      observaciones: body.observaciones,
      servicioIds: body.servicioIds,
    };

    // 2. Ejecutar el caso de uso (acá vive toda la lógica).
    const resultado = await this.crearTurno.ejecutar(cmd);

    // 3. Traducir el resultado a una respuesta HTTP.
    if (!resultado.exito) {
      // Validación fallida = el cliente pidió algo no agendable
      return {
        ok: false,
        errores: resultado.errores,
      };
    }

    // Turno creado -> 201 con el turno
    return {
      ok: true,
      turno: resultado.valor!.aVista(),
    };
  }

  // --- Iteración 2: ciclo de vida del turno ---

  @Post(':id/confirmar') // RN-03, RN-13: revalida antes de confirmar
  @HttpCode(HttpStatus.OK)
  async confirmar(@Param('id', ParseUUIDPipe) id: string) {
    const turno = exigirExito(
      await this.confirmarTurno.ejecutar(id),
      'El turno',
    );
    return { ok: true, turno: turno.aVista() };
  }

  @Post(':id/cancelar') // RN-21
  @HttpCode(HttpStatus.OK)
  async cancelar(@Param('id', ParseUUIDPipe) id: string) {
    const turno = exigirExito(
      await this.cancelarTurno.ejecutar(id),
      'El turno',
    );
    return { ok: true, turno: turno.aVista() };
  }

  @Post(':id/rechazar') // RN-21
  @HttpCode(HttpStatus.OK)
  async rechazar(@Param('id', ParseUUIDPipe) id: string) {
    const turno = exigirExito(
      await this.rechazarTurno.ejecutar(id),
      'El turno',
    );
    return { ok: true, turno: turno.aVista() };
  }

  @Post(':id/inasistencia') // RN-26, RN-31
  @HttpCode(HttpStatus.OK)
  async inasistencia(@Param('id', ParseUUIDPipe) id: string) {
    const turno = exigirExito(
      await this.registrarInasistencia.ejecutar(id),
      'El turno',
    );
    return { ok: true, turno: turno.aVista() };
  }
}
