// src/cobros/cobros.controller.ts
import {
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
import { RegistrarCobroUseCase } from './application/registrar-cobro.use-case';
import { ConsultarCobrosUseCase } from './application/consultar-cobros.use-case';
import { PrecioInformado } from './domain/calculador-importe';
import { exigirExito, leerFecha } from '../comun/respuestas-http';

interface RegistrarCobroBody {
  importe: number;
  medioPago: string; // EFECTIVO | TRANSFERENCIA
  transferenciaVerificada?: boolean;
  preciosInformados?: PrecioInformado[];
  requiereSeguimiento?: boolean;
}

@Controller()
export class CobrosController {
  constructor(
    private readonly registrarCobro: RegistrarCobroUseCase,
    private readonly consultarCobros: ConsultarCobrosUseCase,
  ) {}

  // POST /turnos/:id/cobro — ECU-02 Registrar Cobro del Turno
  @Post('turnos/:id/cobro')
  @HttpCode(HttpStatus.CREATED)
  async registrar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: RegistrarCobroBody,
  ) {
    const cierre = exigirExito(
      await this.registrarCobro.ejecutar({
        turnoId: id,
        importe: body.importe,
        medioPago: String(body.medioPago ?? '').toUpperCase(),
        transferenciaVerificada: body.transferenciaVerificada,
        preciosInformados: body.preciosInformados,
        requiereSeguimiento: body.requiereSeguimiento,
      }),
      'El turno',
    );
    return {
      ok: true,
      cobro: cierre.cobro.aVista(),
      turno: cierre.turno.aVista(),
      seguimiento: cierre.seguimiento ? cierre.seguimiento.aVista() : null,
    };
  }

  // GET /cobros?desde=2026-11-01&hasta=2026-11-30 — por defecto, el mes actual
  @Get('cobros')
  async consultar(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    const hoy = new Date();
    const inicio =
      leerFecha(desde, 'desde') ??
      new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const fin = leerFecha(hasta, 'hasta');
    // "hasta" incluye todo ese día
    const finEfectivo = fin
      ? new Date(
          fin.getFullYear(),
          fin.getMonth(),
          fin.getDate(),
          23,
          59,
          59,
          999,
        )
      : new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);
    return {
      ok: true,
      ...(await this.consultarCobros.ejecutar(inicio, finEfectivo)),
    };
  }
}
