# Dra. Vanesa Klimaszewski

Sitio institucional de la Dra. Vanesa Klimaszewski, médica especialista en Medicina General y Familiar con especial dedicación a la Diabetología. Presenta su enfoque profesional, servicios, formación, artículos educativos y canales de contacto.

**Sitio publicado:** [doctoravanesaklima.com.ar](https://doctoravanesaklima.com.ar/)

## Contenido del sitio

- Medicina general y familiar.
- Atención y seguimiento de diabetes.
- Médica de cabecera PAMI.
- Atención particular.
- Videoconsultas.
- Domicilios programados en Tigre.
- Información sobre formación y experiencia.
- Artículos de educación para la salud.
- Formulario de consultas con alternativa por email y acceso directo a WhatsApp.

## Tecnología

El sitio principal es estático y está construido con HTML, CSS y JavaScript sin dependencias de ejecución. Se publica mediante GitHub Pages.

El formulario se procesa por separado en Nuthost para conservar allí el servicio de correo del dominio. El receptor utiliza PHP, validación del lado del servidor y distintas medidas antispam.

## Estructura principal

```text
.
├── index.html                 # Página principal
├── mednix.css                 # Estilos activos del sitio
├── script.js                  # Navegación, animaciones y formulario
├── articulos/                 # Artículos educativos
├── assets/                    # Imágenes, iconos y recursos locales
├── CNAME                      # Dominio personalizado de GitHub Pages
├── robots.txt                 # Directivas de rastreo
├── sitemap.xml                # Mapa del sitio
├── llms.txt                   # Resumen estructurado para asistentes de IA
└── humans.txt                 # Autoría profesional y técnica
```

## Desarrollo local

No requiere compilación. Puede abrirse `index.html` directamente o servirse con cualquier servidor HTTP local para probar rutas y solicitudes del formulario.

El formulario conserva una alternativa por email si el receptor remoto no está disponible. Para una prueba completa, el subdominio del formulario debe estar en línea y contar con HTTPS.

## SEO y accesibilidad para máquinas

La publicación incluye:

- URLs canónicas en el dominio oficial.
- Metadatos Open Graph y Twitter.
- Datos estructurados Schema.org para la profesional, el consultorio y los artículos.
- `sitemap.xml` y `robots.txt`.
- `llms.txt` con información verificable y enlaces principales.
- Imágenes con dimensiones intrínsecas para reducir saltos de contenido.
- HTML semántico, navegación accesible y estados anunciados en el formulario.

## Seguridad y antispam

El sitio evita dependencias externas de ejecución y aplica una política de seguridad de contenido compatible con GitHub Pages. El receptor del formulario valida origen, tipo y longitud de los campos, limita la frecuencia de envíos, detecta automatizaciones mediante un campo trampa y un tiempo mínimo de completado, y no almacena el contenido de las consultas.

Los datos enviados se utilizan exclusivamente para responder el mensaje. Este repositorio no contiene contraseñas, credenciales de correo ni claves privadas.

## Publicación

La rama predeterminada se publica con GitHub Pages. El archivo `CNAME` conserva el dominio `doctoravanesaklima.com.ar`.

El DNS se divide por servicio:

- La web principal y `www` apuntan a GitHub Pages.
- El correo, webmail y demás servicios de hosting permanecen en Nuthost.
- El receptor del formulario utiliza un subdominio independiente alojado en Nuthost.

## Créditos

Diseño y desarrollo web por [Estudio Ideamos](https://ideamos.com.ar/).

## Aviso de salud

El contenido de los artículos es informativo y no reemplaza una evaluación médica. El sitio no ofrece atención de emergencias.
