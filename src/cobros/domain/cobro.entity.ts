// src/cobros/domain/cobro.entity.ts
// Liquida un turno atendido (RF-11). El Cobro conoce al turno que liquida;
// el Turno no necesita conocer su cobro (asociación dirigida Cobro -> Turno).
import { randomUUID } from 'crypto';
import { MedioPago } from './medio-pago';

export class Cobro {
  constructor(
    private readonly id: string,
    private readonly turnoId: string,
    private readonly fechaHora: Date,
    private readonly importeSugerido: number | null, // null si hubo servicios "a consultar" sin precio
    private readonly importe: number,
    private readonly medioPago: MedioPago,
    private readonly transferenciaVerificada: boolean,
  ) {}

  // RN-28: un único pago al finalizar el servicio.
  static registrar(datos: {
    turnoId: string;
    fechaHora: Date;
    importeSugerido: number | null;
    importe: number;
    medioPago: MedioPago;
    transferenciaVerificada: boolean;
  }): Cobro {
    return new Cobro(
      randomUUID(),
      datos.turnoId,
      datos.fechaHora,
      datos.importeSugerido,
      datos.importe,
      datos.medioPago,
      // Solo tiene sentido para transferencias
      datos.medioPago === MedioPago.TRANSFERENCIA
        ? datos.transferenciaVerificada
        : false,
    );
  }

  get getId(): string {
    return this.id;
  }
  get getTurnoId(): string {
    return this.turnoId;
  }
  get getFechaHora(): Date {
    return this.fechaHora;
  }
  get getImporteSugerido(): number | null {
    return this.importeSugerido;
  }
  get getImporte(): number {
    return this.importe;
  }
  get getMedioPago(): MedioPago {
    return this.medioPago;
  }
  get getTransferenciaVerificada(): boolean {
    return this.transferenciaVerificada;
  }

  aVista() {
    return {
      id: this.id,
      turnoId: this.turnoId,
      fechaHora: this.fechaHora,
      importeSugerido: this.importeSugerido,
      importe: this.importe,
      medioPago: this.medioPago,
      transferenciaVerificada: this.transferenciaVerificada,
    };
  }
}
