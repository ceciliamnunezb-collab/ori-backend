-- CreateEnum
CREATE TYPE "EstadoTurno" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'CANCELADO', 'RECHAZADO', 'COMPLETADO');

-- CreateEnum
CREATE TYPE "VisibilidadPrecio" AS ENUM ('PUBLICO', 'OCULTO', 'A_CONSULTAR');

-- CreateTable
CREATE TABLE "profesional" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "max_turnos_simultaneos" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "profesional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_sistema" (
    "id" UUID NOT NULL,
    "profesional_id" UUID NOT NULL,
    "intervalo_turnos_min" INTEGER NOT NULL DEFAULT 30,
    "ventana_reserva_dias" INTEGER NOT NULL DEFAULT 30,
    "horas_antes_recordatorio" INTEGER NOT NULL DEFAULT 24,
    "porcentaje_desc_cumple" INTEGER NOT NULL DEFAULT 25,

    CONSTRAINT "configuracion_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicio_categoria" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "servicio_categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicio" (
    "id" UUID NOT NULL,
    "profesional_id" UUID NOT NULL,
    "categoria_id" UUID,
    "nombre" TEXT NOT NULL,
    "duracion_min" INTEGER NOT NULL,
    "precio" DECIMAL(10,2),
    "visibilidad_precio" "VisibilidadPrecio" NOT NULL DEFAULT 'PUBLICO',
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disponibilidad" (
    "id" UUID NOT NULL,
    "profesional_id" UUID NOT NULL,
    "dia_semana" INTEGER NOT NULL,
    "hora_inicio" TIME NOT NULL,
    "hora_fin" TIME NOT NULL,

    CONSTRAINT "disponibilidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bloqueo_fecha" (
    "id" UUID NOT NULL,
    "profesional_id" UUID NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE NOT NULL,
    "motivo" TEXT,

    CONSTRAINT "bloqueo_fecha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "fecha_nacimiento" DATE,
    "es_habitual" BOOLEAN NOT NULL DEFAULT false,
    "acepta_promociones" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turno" (
    "id" UUID NOT NULL,
    "profesional_id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL,
    "duracion_min" INTEGER NOT NULL,
    "estado" "EstadoTurno" NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "google_event_id" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "turno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turno_servicio" (
    "id" UUID NOT NULL,
    "turno_id" UUID NOT NULL,
    "servicio_id" UUID NOT NULL,
    "duracion_aplicada_min" INTEGER NOT NULL,

    CONSTRAINT "turno_servicio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profesional_email_key" ON "profesional"("email");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_sistema_profesional_id_key" ON "configuracion_sistema"("profesional_id");

-- CreateIndex
CREATE INDEX "servicio_profesional_id_idx" ON "servicio"("profesional_id");

-- CreateIndex
CREATE INDEX "disponibilidad_profesional_id_dia_semana_idx" ON "disponibilidad"("profesional_id", "dia_semana");

-- CreateIndex
CREATE INDEX "bloqueo_fecha_profesional_id_idx" ON "bloqueo_fecha"("profesional_id");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_telefono_key" ON "cliente"("telefono");

-- CreateIndex
CREATE INDEX "turno_profesional_id_fecha_hora_idx" ON "turno"("profesional_id", "fecha_hora");

-- CreateIndex
CREATE UNIQUE INDEX "turno_servicio_turno_id_servicio_id_key" ON "turno_servicio"("turno_id", "servicio_id");

-- AddForeignKey
ALTER TABLE "configuracion_sistema" ADD CONSTRAINT "configuracion_sistema_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "profesional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicio" ADD CONSTRAINT "servicio_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "profesional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicio" ADD CONSTRAINT "servicio_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "servicio_categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidad" ADD CONSTRAINT "disponibilidad_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "profesional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloqueo_fecha" ADD CONSTRAINT "bloqueo_fecha_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "profesional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turno" ADD CONSTRAINT "turno_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "profesional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turno" ADD CONSTRAINT "turno_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turno_servicio" ADD CONSTRAINT "turno_servicio_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "turno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turno_servicio" ADD CONSTRAINT "turno_servicio_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
