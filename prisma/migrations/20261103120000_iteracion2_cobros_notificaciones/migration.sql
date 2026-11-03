-- AlterEnum
ALTER TYPE "EstadoTurno" ADD VALUE 'AUSENTE';

-- CreateEnum
CREATE TYPE "MedioPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "EstadoNotificacion" AS ENUM ('PENDIENTE', 'ENVIADA');

-- AlterTable
ALTER TABLE "servicio" ADD COLUMN     "dias_seguimiento" INTEGER;

-- AlterTable
ALTER TABLE "turno" ADD COLUMN     "requiere_seguimiento" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "turno_servicio" ADD COLUMN     "precio_aplicado" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "cobro" (
    "id" UUID NOT NULL,
    "turno_id" UUID NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "importe_sugerido" DECIMAL(10,2),
    "importe" DECIMAL(10,2) NOT NULL,
    "medio_pago" "MedioPago" NOT NULL,
    "transferencia_verificada" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "cobro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_notificacion" (
    "id" UUID NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "plantilla_mensaje" TEXT NOT NULL,

    CONSTRAINT "tipo_notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacion" (
    "id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "turno_id" UUID,
    "tipo_notificacion_id" UUID NOT NULL,
    "mensaje" TEXT NOT NULL,
    "estado" "EstadoNotificacion" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_generada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_programada" TIMESTAMP(3) NOT NULL,
    "fecha_envio" TIMESTAMP(3),

    CONSTRAINT "notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cobro_turno_id_key" ON "cobro"("turno_id");

-- CreateIndex
CREATE INDEX "cobro_fecha_hora_idx" ON "cobro"("fecha_hora");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_notificacion_codigo_key" ON "tipo_notificacion"("codigo");

-- CreateIndex
CREATE INDEX "notificacion_estado_fecha_programada_idx" ON "notificacion"("estado", "fecha_programada");

-- CreateIndex
CREATE UNIQUE INDEX "notificacion_turno_id_tipo_notificacion_id_key" ON "notificacion"("turno_id", "tipo_notificacion_id");

-- AddForeignKey
ALTER TABLE "cobro" ADD CONSTRAINT "cobro_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "turno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacion" ADD CONSTRAINT "notificacion_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacion" ADD CONSTRAINT "notificacion_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "turno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacion" ADD CONSTRAINT "notificacion_tipo_notificacion_id_fkey" FOREIGN KEY ("tipo_notificacion_id") REFERENCES "tipo_notificacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
