# Seguridad y mantenimiento

Revisión técnica: 2026-09-30. Referencia: https://top10.owasp.org/2025/.
Aplica a la web estática y al receptor PHP; no es una certificación ni garantiza ausencia de vulnerabilidades.

## Protecciones

- CSP sin unsafe-inline para JavaScript. JSON-LD autorizado por hash.
- Un Origin no permitido se rechaza aunque el Referer sea válido.
- Sin archivos adjuntos; tamaño, tipos y longitudes limitados en servidor.
- Destinatarios definidos en servidor, sin direcciones arbitrarias del visitante.
- Campo trampa, tiempo mínimo, filtro de contenido y contadores bloqueados.
- Contador privado: 3 envíos por IP y 60 globales cada 15 minutos; no guarda consultas.
- Fallos del contador detienen el envío. Eventos de error sin datos personales.
- Publicación con lista explícita de archivos públicos; PHP y documentación operativa excluidos.
- Acciones fijadas por SHA y permisos mínimos; pruebas fallidas impiden desplegar.

No hay cuentas de pacientes, sesiones ni base de datos. La autenticación de usuarios y SQL no corresponden a la arquitectura actual. Los filtros no sustituyen un servicio antibots frente a ataques distribuidos.

## Pruebas

Con Node y PHP:

    php -l nuthost-formulario/contacto.php
    node --test qa/security.test.cjs

PHP_BIN permite seleccionar el ejecutable. El correo se reemplaza solo en el proceso de prueba.
Se verifican CSP, recursos, campos inválidos, origen, destinatarios, límites y fallos de almacenamiento.

## Hosting y límites

GitHub Pages no permite definir cabeceras HTTP arbitrarias. La CSP en meta no impone frame-ancestors ni HSTS. Para esas cabeceras hace falta una capa HTTP compatible. HTTPS está activado en Pages.
El receptor PHP incluye cabeceras propias y .htaccess complementario.

El receptor debe instalarse separadamente en Nuthost. El acceso SSH con las claves locales fue rechazado; no se verificó la versión PHP instalada ni se cambió el servidor.
Usar PHP soportado con sus parches: https://www.php.net/supported-versions.php.
Confirmar ambos destinatarios después del despliegue y la entrega a Gmail. Mantener SPF, DKIM y DMARC con el proveedor.
Revisar periódicamente parches y registros. Las dependencias del starter local no versionado no forman parte de esta publicación ni fueron actualizadas.

## Carga

El renderizador conserva los 33 iconos utilizados y reduce su JavaScript de 357796 a aproximadamente 13600 bytes. Se conservan carga diferida de fotos secundarias, dimensiones de imágenes y prioridad de la foto principal.
Se elimina una importación de Google Fonts ya bloqueada por la CSP anterior, conservando las fuentes de respaldo que el navegador venía mostrando.
No se afirma una puntuación Lighthouse ni métricas Core Web Vitals de usuarios reales.