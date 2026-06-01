// src/turnos/domain/puertos/disponibilidad-repository.port.ts
import { Turno } from '../turno.entity';

// Una franja horaria en que el profesional atiende (de tabla DISPONIBILIDAD)
export interface FranjaDisponibilidad {
  diaSemana: number;   // 0=domingo, 1=lunes, ... 6=sábado
  horaInicio: string;  // "09:00"
  horaFin: string;     // "18:00"
}

// Una fecha bloqueada (de tabla BLOQUEO_FECHA)
export interface RangoBloqueo {
  fechaInicio: Date;
  fechaFin: Date;
  motivo: string;
}

// El puerto en sí
export interface IDisponibilidadRepository {
  buscarFranjas(
    profesionalId: string,
    diaSemana: number,
  ): Promise<FranjaDisponibilidad[]>;

  buscarBloqueos(
    profesionalId: string,
    fecha: Date,
  ): Promise<RangoBloqueo[]>;
}