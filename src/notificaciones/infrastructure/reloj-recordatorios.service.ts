// src/notificaciones/infrastructure/reloj-recordatorios.service.ts
// Actor "Reloj del sistema": cada cierto intervalo genera los recordatorios
// pendientes sin intervención de la profesional.
// El intervalo se configura con RECORDATORIOS_INTERVALO_MIN (por defecto 60).
// Con RECORDATORIOS_INTERVALO_MIN=0 el reloj queda apagado (útil en pruebas).
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { GenerarRecordatoriosUseCase } from '../application/generar-recordatorios.use-case';

@Injectable()
export class RelojRecordatoriosService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger('RelojRecordatorios');
  private temporizador?: NodeJS.Timeout;

  constructor(private readonly generar: GenerarRecordatoriosUseCase) {}

  onModuleInit(): void {
    const minutos = Number(process.env.RECORDATORIOS_INTERVALO_MIN ?? 60);
    if (!minutos || minutos <= 0) return;
    this.temporizador = setInterval(() => void this.tic(), minutos * 60_000);
    this.logger.log(
      `Generación automática de recordatorios cada ${minutos} min.`,
    );
  }

  onModuleDestroy(): void {
    if (this.temporizador) clearInterval(this.temporizador);
  }

  private async tic(): Promise<void> {
    try {
      const generadas = await this.generar.ejecutar();
      if (generadas.length > 0) {
        this.logger.log(`Se generaron ${generadas.length} recordatorio(s).`);
      }
    } catch (e) {
      this.logger.error('No se pudieron generar los recordatorios', e as Error);
    }
  }
}
