// src/notificaciones/domain/puertos/mensaje.port.ts
// Puerto de salida hacia el canal de mensajería. El esquema es híbrido
// (RE-05): el sistema no envía, genera el enlace para que la profesional
// abra WhatsApp con el mensaje ya escrito.
export interface IMensajePort {
  generarEnlace(telefono: string, mensaje: string): string;
}
