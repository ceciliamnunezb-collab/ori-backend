// src/turnos/domain/validaciones/resultado.ts
export class Resultado {
  private constructor(
    public readonly esValido: boolean,
    public readonly errores: string[],
  ) {}

  static ok(): Resultado {
    return new Resultado(true, []);
  }

  static error(mensaje: string): Resultado {
    return new Resultado(false, [mensaje]);
  }

  static combinar(resultados: Resultado[]): Resultado {
    const todosLosErrores = resultados.flatMap((r) => r.errores);
    return new Resultado(todosLosErrores.length === 0, todosLosErrores);
  }
}