// src/turnos/turnos.controller.ts
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CrearTurnoUseCase } from './application/crear-turno.use-case';
import { CrearTurnoCommand, OrigenTurno } from './application/crear-turno.command';

// Forma del JSON que llega por HTTP. Todo lo que viaja por la red es texto:
// por eso fechaHora entra como string y se convierte a Date más abajo.
interface CrearTurnoBody {
  origen: OrigenTurno;
  profesionalId: string;
  clienteId: string;
  fechaHora: string;
  duracionMin: number;
  observaciones?: string;
}

@Controller('turnos') // todas las rutas de este controller cuelgan de /turnos
export class TurnosController {
  constructor(private readonly crearTurno: CrearTurnoUseCase) {}

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
    };

    // 2. Ejecutar el caso de uso (acá vive toda la lógica).
    const resultado = await this.crearTurno.ejecutar(cmd);

    // 3. Traducir el resultado a una respuesta HTTP.
    if (!resultado.exito) {
      // Validación fallida = el cliente pidió algo no agendable -> 400
      return {
        ok: false,
        errores: resultado.errores,
      };
    }

    // Turno creado -> 201 con el turno
    return {
      ok: true,
      turno: resultado.valor,
    };
  }
}