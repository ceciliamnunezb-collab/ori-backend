// src/comun/respuestas-http.ts
// Traduce un ResultadoOperacion a la respuesta HTTP:
//  - null (no existe)        -> 404
//  - fallo de validación     -> 400 con la lista de errores
//  - éxito                   -> el valor (lo serializa cada controller)
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ResultadoOperacion } from '../turnos/application/resultado-operacion';

export function exigirExito<T>(
  resultado: ResultadoOperacion<T> | null,
  queNoExiste: string,
): T {
  if (resultado === null) {
    throw new NotFoundException({
      ok: false,
      errores: [`${queNoExiste} no existe.`],
    });
  }
  if (!resultado.exito) {
    throw new BadRequestException({ ok: false, errores: resultado.errores });
  }
  return resultado.valor as T;
}

// Fechas de query string: "2026-11-01" o "2026-11-01T10:00:00"
export function leerFecha(
  valor: string | undefined,
  nombre: string,
): Date | undefined {
  if (valor === undefined || valor === '') return undefined;
  const fecha = new Date(valor.length === 10 ? `${valor}T00:00:00` : valor);
  if (Number.isNaN(fecha.getTime())) {
    throw new BadRequestException({
      ok: false,
      errores: [`Fecha inválida en "${nombre}".`],
    });
  }
  return fecha;
}
