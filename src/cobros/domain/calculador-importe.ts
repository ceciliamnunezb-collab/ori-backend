// src/cobros/domain/calculador-importe.ts
// RN-29: el importe sugerido es la suma de los precios de los servicios
// del turno. Para los servicios "a consultar", la profesional informa
// el precio al cobrar. Además congela el precio aplicado en cada detalle.
import { DetalleTurno } from '../../turnos/domain/detalle-turno';

export interface PrecioInformado {
  servicioId: string;
  precio: number;
}

export interface ImporteCalculado {
  importeSugerido: number | null; // null si falta el precio de algún servicio
  serviciosSinPrecio: string[]; // nombres de los servicios sin precio
}

export class CalculadorImporte {
  static sugerir(
    detalles: DetalleTurno[],
    preciosInformados: PrecioInformado[] = [],
  ): ImporteCalculado {
    const informados = new Map(
      preciosInformados.map((p) => [p.servicioId, p.precio]),
    );
    const sinPrecio: string[] = [];
    let total = 0;

    for (const d of detalles) {
      const precio = d.precioLista ?? informados.get(d.servicioId) ?? null;
      if (precio === null || !Number.isFinite(precio) || precio < 0) {
        sinPrecio.push(d.nombreServicio);
        continue;
      }
      d.aplicarPrecio(precio);
      total += precio;
    }

    const sugerido =
      detalles.length > 0 && sinPrecio.length === 0
        ? Math.round(total * 100) / 100
        : null;
    return { importeSugerido: sugerido, serviciosSinPrecio: sinPrecio };
  }
}
