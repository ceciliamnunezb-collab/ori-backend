// src/cobros/application/consultar-cobros.use-case.ts
// RF-11.5: lo recaudado por período, total y por medio de pago.
import { Inject, Injectable } from '@nestjs/common';
import type {
  CobroVista,
  ICobroRepository,
} from '../domain/puertos/cobro-repository.port';
import { MedioPago } from '../domain/medio-pago';

export interface ResumenCobros {
  desde: Date;
  hasta: Date;
  total: number;
  cantidad: number;
  porMedioPago: Record<MedioPago, { cantidad: number; total: number }>;
  cobros: CobroVista[];
}

@Injectable()
export class ConsultarCobrosUseCase {
  constructor(
    @Inject('ICobroRepository') private readonly repo: ICobroRepository,
  ) {}

  async ejecutar(desde: Date, hasta: Date): Promise<ResumenCobros> {
    const cobros = await this.repo.listarPorPeriodo(desde, hasta);
    const porMedioPago = {
      [MedioPago.EFECTIVO]: { cantidad: 0, total: 0 },
      [MedioPago.TRANSFERENCIA]: { cantidad: 0, total: 0 },
    };
    let total = 0;
    for (const c of cobros) {
      porMedioPago[c.medioPago].cantidad += 1;
      porMedioPago[c.medioPago].total += c.importe;
      total += c.importe;
    }
    const redondear = (n: number) => Math.round(n * 100) / 100;
    for (const m of Object.values(porMedioPago)) m.total = redondear(m.total);
    return {
      desde,
      hasta,
      total: redondear(total),
      cantidad: cobros.length,
      porMedioPago,
      cobros,
    };
  }
}
