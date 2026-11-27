## Qué hace este PR

<Una o dos oraciones. Indicar el requerimiento o la regla de negocio (RF-xx, RN-xx).>

## Checklist

- [ ] El check de CI está en verde (tipos, pruebas y compilación)
- [ ] Lo probé en mi máquina contra la base local (Postman o PowerShell + pgAdmin)
- [ ] Las validaciones de negocio están en el dominio, no en el controller
- [ ] Si se tocó el modelo de datos, hay migración de Prisma y se actualizó el DER
- [ ] Si hay variables de entorno nuevas, están en `.env.example` (sin valores reales)

### Pruebas

- [ ] Si cambió una regla de negocio (RN-xx), cambió o se agregó su prueba unitaria
- [ ] Vi fallar la prueba nueva al menos una vez antes de que pase
- [ ] El valor esperado de cada prueba sale de la especificación, no de lo que devuelve el código
- [ ] Ninguna prueba se arregló cambiando el valor esperado
