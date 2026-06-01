-- Restricciones de integridad a nivel de base de datos (defensa en profundidad)

-- Duración siempre positiva (servicio y turno)
ALTER TABLE "servicio"
  ADD CONSTRAINT "servicio_duracion_positiva" CHECK ("duracion_min" > 0);

ALTER TABLE "turno"
  ADD CONSTRAINT "turno_duracion_positiva" CHECK ("duracion_min" > 0);

-- Precio no negativo (puede ser NULL = "a consultar", pero nunca negativo)
ALTER TABLE "servicio"
  ADD CONSTRAINT "servicio_precio_no_negativo" CHECK ("precio" IS NULL OR "precio" >= 0);

-- Al menos un turno simultáneo permitido (RN-03)
ALTER TABLE "profesional"
  ADD CONSTRAINT "profesional_max_turnos_min" CHECK ("max_turnos_simultaneos" >= 1);

-- Coherencia de la franja horaria (RN-23)
ALTER TABLE "disponibilidad"
  ADD CONSTRAINT "disponibilidad_franja_coherente" CHECK ("hora_fin" > "hora_inicio");

-- Día de semana válido (0 = domingo … 6 = sábado)
ALTER TABLE "disponibilidad"
  ADD CONSTRAINT "disponibilidad_dia_valido" CHECK ("dia_semana" BETWEEN 0 AND 6);

-- Rango de bloqueo válido (fin no anterior al inicio)
ALTER TABLE "bloqueo_fecha"
  ADD CONSTRAINT "bloqueo_rango_valido" CHECK ("fecha_fin" >= "fecha_inicio");