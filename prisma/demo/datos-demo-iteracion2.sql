-- ============================================================
--  Ori — Datos de demostración de la Iteración 2
--  Se puede ejecutar varias veces (borra y vuelve a crear SOLO
--  los registros de la demo, identificados por sus ids fijos).
--
--  Crea:
--   - 3 servicios: Corte ($15.000), Peinado ("a consultar") y
--     Coloración ($30.000, seguimiento a los 20 días)
--   - Turno A: CONFIRMADO, empezó hace 1 hora  -> para registrar el cobro
--   - Turno B: CONFIRMADO, empezó hace 30 min  -> para registrar la inasistencia
--   - Turno C: CONFIRMADO, mañana              -> para generar el recordatorio
--
--  Las fechas se guardan en UTC, igual que las guarda la aplicación.
-- ============================================================

-- Profesional y cliente de prueba (si ya existen, no se tocan)
INSERT INTO "profesional" ("id", "nombre", "email", "password_hash", "max_turnos_simultaneos")
VALUES ('11111111-1111-4111-8111-111111111111', 'Débora Rinaldo', 'debi@ori.local', 'demo', 2)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "cliente" ("id", "nombre", "telefono")
VALUES ('22222222-2222-4222-8222-222222222222', 'Valentina Ruiz', '+5493411234567')
ON CONFLICT ("id") DO NOTHING;

-- Limpieza de una ejecución anterior
DELETE FROM "notificacion" WHERE "turno_id" IN ('d2000000-0000-4000-8000-00000000000a','d2000000-0000-4000-8000-00000000000b','d2000000-0000-4000-8000-00000000000c');
DELETE FROM "cobro"        WHERE "turno_id" IN ('d2000000-0000-4000-8000-00000000000a','d2000000-0000-4000-8000-00000000000b','d2000000-0000-4000-8000-00000000000c');
DELETE FROM "turno"        WHERE "id"       IN ('d2000000-0000-4000-8000-00000000000a','d2000000-0000-4000-8000-00000000000b','d2000000-0000-4000-8000-00000000000c');
DELETE FROM "servicio"     WHERE "id"       IN ('d1000000-0000-4000-8000-000000000001','d1000000-0000-4000-8000-000000000002','d1000000-0000-4000-8000-000000000003');

-- Servicios
INSERT INTO "servicio" ("id", "profesional_id", "nombre", "duracion_min", "precio", "visibilidad_precio", "dias_seguimiento") VALUES
  ('d1000000-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Corte',      40, 15000, 'PUBLICO',     NULL),
  ('d1000000-0000-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'Peinado',    30, NULL,  'A_CONSULTAR', NULL),
  ('d1000000-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'Coloración', 90, 30000, 'PUBLICO',     20);

-- Turnos (fecha_hora en UTC)
INSERT INTO "turno" ("id", "profesional_id", "cliente_id", "fecha_hora", "duracion_min", "estado") VALUES
  ('d2000000-0000-4000-8000-00000000000a', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222',
   date_trunc('minute', (now() AT TIME ZONE 'UTC') - interval '1 hour'),   70, 'CONFIRMADO'),
  ('d2000000-0000-4000-8000-00000000000b', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222',
   date_trunc('minute', (now() AT TIME ZONE 'UTC') - interval '30 minutes'), 40, 'CONFIRMADO'),
  ('d2000000-0000-4000-8000-00000000000c', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222',
   date_trunc('minute', (now() AT TIME ZONE 'UTC') + interval '20 hours'), 120, 'CONFIRMADO');

-- Servicios de cada turno
INSERT INTO "turno_servicio" ("id", "turno_id", "servicio_id", "duracion_aplicada_min") VALUES
  ('d3000000-0000-4000-8000-000000000001', 'd2000000-0000-4000-8000-00000000000a', 'd1000000-0000-4000-8000-000000000001', 40),
  ('d3000000-0000-4000-8000-000000000002', 'd2000000-0000-4000-8000-00000000000a', 'd1000000-0000-4000-8000-000000000002', 30),
  ('d3000000-0000-4000-8000-000000000003', 'd2000000-0000-4000-8000-00000000000b', 'd1000000-0000-4000-8000-000000000001', 40),
  ('d3000000-0000-4000-8000-000000000004', 'd2000000-0000-4000-8000-00000000000c', 'd1000000-0000-4000-8000-000000000003', 90),
  ('d3000000-0000-4000-8000-000000000005', 'd2000000-0000-4000-8000-00000000000c', 'd1000000-0000-4000-8000-000000000001', 30);
