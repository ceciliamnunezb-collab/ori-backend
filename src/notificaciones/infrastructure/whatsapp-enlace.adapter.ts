// src/notificaciones/infrastructure/whatsapp-enlace.adapter.ts
// Adaptador del puerto IMensajePort: arma un enlace wa.me con el texto
// pre-cargado (SP-08). No usa APIs pagas de WhatsApp (RE-02, RE-05).
import { Injectable } from '@nestjs/common';
import { IMensajePort } from '../domain/puertos/mensaje.port';

@Injectable()
export class WhatsAppEnlaceAdapter implements IMensajePort {
  generarEnlace(telefono: string, mensaje: string): string {
    const numero = telefono.replace(/\D/g, ''); // wa.me solo acepta dígitos
    return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  }
}
