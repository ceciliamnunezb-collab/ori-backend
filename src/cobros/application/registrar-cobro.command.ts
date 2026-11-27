// src/cobros/application/registrar-cobro.command.ts
import { PrecioInformado } from '../domain/calculador-importe';

export interface RegistrarCobroCommand {
  turnoId: string;
  importe: number;
  medioPago: string;
  transferenciaVerificada?: boolean;
  preciosInformados?: PrecioInformado[]; // servicios "a consultar"
  requiereSeguimiento?: boolean; // RN-22
}
