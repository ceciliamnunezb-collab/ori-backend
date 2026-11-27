import { NotificacionFactory } from './notificacion.factory';
import { PlantillaMensaje } from './plantilla-mensaje';
import { EstadoNotificacion } from './estado-notificacion';
import { NotificacionYaEnviadaError } from './notificacion-ya-enviada.error';
import { WhatsAppEnlaceAdapter } from '../infrastructure/whatsapp-enlace.adapter';

const datos = {
  turnoId: 't1',
  clienteId: 'c1',
  nombreCliente: 'Carolina',
  fechaHoraTurno: new Date('2026-11-21T17:00:00'),
  servicios: ['Mechas', 'Corte'],
};
const plantilla =
  '¡Hola {nombre}! Te recuerdo tu turno del {fecha} a las {hora} para {servicios}.';
const ahora = new Date('2026-11-20T09:00:00');

describe('Notificaciones', () => {
  it('Factory: el recordatorio se programa X horas antes y completa la plantilla (RN-06)', () => {
    const n = NotificacionFactory.recordatorio(datos, plantilla, 24, ahora);
    expect(n.getEstado).toBe(EstadoNotificacion.PENDIENTE);
    expect(n.getFechaProgramada).toEqual(new Date('2026-11-20T17:00:00'));
    expect(n.getMensaje).toBe(
      '¡Hola Carolina! Te recuerdo tu turno del 21/11 a las 17:00 para Mechas y Corte.',
    );
  });

  it('se envía una sola vez (RF-08.5)', () => {
    const n = NotificacionFactory.recordatorio(datos, plantilla, 24, ahora);
    n.marcarEnviada(ahora);
    expect(n.getEstado).toBe(EstadoNotificacion.ENVIADA);
    expect(() => n.marcarEnviada(ahora)).toThrow(NotificacionYaEnviadaError);
    expect(() => n.editarMensaje('otro')).toThrow(NotificacionYaEnviadaError);
  });

  it('la profesional puede editar el mensaje antes de enviarlo', () => {
    const n = NotificacionFactory.recordatorio(datos, plantilla, 24, ahora);
    n.editarMensaje('  Texto propio  ');
    expect(n.getMensaje).toBe('Texto propio');
  });

  it('plantilla: deja intactos los marcadores desconocidos', () => {
    expect(
      PlantillaMensaje.completar('Hola {nombre} {x}', { nombre: 'Ana' }),
    ).toBe('Hola Ana {x}');
  });

  it('el enlace de WhatsApp usa solo dígitos y codifica el texto', () => {
    const enlace = new WhatsAppEnlaceAdapter().generarEnlace(
      '+54 9 341 123-4567',
      '¡Hola Ana!',
    );
    expect(enlace).toBe('https://wa.me/5493411234567?text=%C2%A1Hola%20Ana!');
  });
});
