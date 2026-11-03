-- Iteración 2: restricciones de integridad (defensa en profundidad) y datos de catálogo

-- El importe cobrado siempre es positivo (RN-29)
ALTER TABLE "cobro"
  ADD CONSTRAINT "cobro_importe_positivo" CHECK ("importe" > 0);

-- El importe sugerido puede faltar ("a consultar"), pero nunca es negativo
ALTER TABLE "cobro"
  ADD CONSTRAINT "cobro_importe_sugerido_no_negativo" CHECK ("importe_sugerido" IS NULL OR "importe_sugerido" >= 0);

-- Una transferencia solo se registra si la profesional verificó la acreditación
ALTER TABLE "cobro"
  ADD CONSTRAINT "cobro_transferencia_verificada" CHECK ("medio_pago" <> 'TRANSFERENCIA' OR "transferencia_verificada" = true);

-- Precio aplicado por servicio no negativo
ALTER TABLE "turno_servicio"
  ADD CONSTRAINT "turno_servicio_precio_no_negativo" CHECK ("precio_aplicado" IS NULL OR "precio_aplicado" >= 0);

-- Días de seguimiento positivos cuando se configuran (RF-01.3)
ALTER TABLE "servicio"
  ADD CONSTRAINT "servicio_dias_seguimiento_positivo" CHECK ("dias_seguimiento" IS NULL OR "dias_seguimiento" > 0);

-- Una notificación enviada siempre tiene fecha de envío
ALTER TABLE "notificacion"
  ADD CONSTRAINT "notificacion_envio_coherente" CHECK ("estado" <> 'ENVIADA' OR "fecha_envio" IS NOT NULL);

-- Catálogo de tipos de notificación con su plantilla base.
-- Marcadores: {nombre}, {fecha}, {hora}, {servicios}, {descuento}
INSERT INTO "tipo_notificacion" ("id", "codigo", "nombre", "plantilla_mensaje") VALUES
  ('a1000000-0000-4000-8000-000000000001', 'RECORDATORIO', 'Recordatorio de turno',
   '¡Hola {nombre}! Te recuerdo tu turno del {fecha} a las {hora} para {servicios}. Si no podés venir, avisame así le doy el lugar a otra persona. ¡Te espero! Débora'),
  ('a1000000-0000-4000-8000-000000000002', 'SEGUIMIENTO', 'Seguimiento post-servicio',
   '¡Hola {nombre}! ¿Cómo te fue con tu {servicios}? Cuando quieras coordinamos tu próximo turno. Débora'),
  ('a1000000-0000-4000-8000-000000000003', 'CUMPLEANIOS', 'Saludo de cumpleaños',
   '¡Feliz cumpleaños {nombre}! Tenés un {descuento}% de descuento en tu próximo turno. Débora');
