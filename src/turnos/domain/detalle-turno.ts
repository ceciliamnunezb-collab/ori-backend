// src/turnos/domain/detalle-turno.ts
// Parte del Turno (composición): un servicio incluido en el turno.
// No conoce al Turno; el Turno conoce su lista de detalles.
//  - duracionAplicadaMin: duración congelada al crear el turno (RN-14).
//  - precioLista: precio del servicio (null si es "a consultar", RN-05).
//  - precioAplicado: precio congelado al momento del cobro (Iteración 2).
export class DetalleTurno {
  constructor(
    public readonly servicioId: string,
    public readonly nombreServicio: string,
    public readonly duracionAplicadaMin: number,
    public readonly precioLista: number | null,
    public readonly diasSeguimiento: number | null,
    private precioAplicado: number | null = null,
  ) {}

  aplicarPrecio(precio: number): void {
    this.precioAplicado = precio;
  }

  get getPrecioAplicado(): number | null {
    return this.precioAplicado;
  }
}
