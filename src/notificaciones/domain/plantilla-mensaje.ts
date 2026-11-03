// src/notificaciones/domain/plantilla-mensaje.ts
// Reemplaza los marcadores {nombre}, {fecha}, {hora}, {servicios}, {descuento}
// de la plantilla del tipo de notificación.
export type VariablesMensaje = Record<string, string>;

export class PlantillaMensaje {
  static completar(plantilla: string, variables: VariablesMensaje): string {
    return plantilla.replace(/\{(\w+)\}/g, (marca, clave: string) =>
      clave in variables ? variables[clave] : marca,
    );
  }

  static fecha(f: Date): string {
    const dd = f.getDate().toString().padStart(2, '0');
    const mm = (f.getMonth() + 1).toString().padStart(2, '0');
    return `${dd}/${mm}`;
  }

  static hora(f: Date): string {
    const hh = f.getHours().toString().padStart(2, '0');
    const mi = f.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mi}`;
  }

  // "Corte", "Corte y Peinado", "Corte, Color y Peinado"
  static servicios(nombres: string[]): string {
    if (nombres.length === 0) return 'tu servicio';
    if (nombres.length === 1) return nombres[0];
    return `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`;
  }
}
