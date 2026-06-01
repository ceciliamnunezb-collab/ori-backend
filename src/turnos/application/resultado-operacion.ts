// src/turnos/application/resultado-operacion.ts
export class ResultadoOperacion<T> {
  private constructor(
    public readonly exito: boolean,
    public readonly valor?: T,
    public readonly errores: string[] = [],
  ) {}

  static ok<T>(valor: T): ResultadoOperacion<T> {
    return new ResultadoOperacion<T>(true, valor, []);
  }

  static fallo<T>(errores: string[]): ResultadoOperacion<T> {
    return new ResultadoOperacion<T>(false, undefined, errores);
  }
}