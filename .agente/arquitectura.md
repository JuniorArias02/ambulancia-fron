# Reglas de desarrollo Frontend Web — Ambulancias Galenos

## 1. Objetivo del proyecto

Desarrollar la plataforma web de **Ambulancias Galenos**, destinada a la gestión y supervisión de emergencias, despacho de ambulancias, monitoreo geográfico en tiempo real, seguimiento de servicios, atención prehospitalaria, estadísticas y administración del sistema.

La interfaz debe ser clara, rápida, segura y adaptable a las necesidades operativas del personal que coordina las emergencias.

El frontend debe mantener una arquitectura modular, separación de responsabilidades y componentes reutilizables. Debe consumir el backend mediante API REST y utilizar WebSockets para las actualizaciones en tiempo real.

Antes de modificar el código, inspecciona el proyecto existente y conserva sus decisiones técnicas y visuales cuando sean válidas.

## 2. Stack tecnológico obligatorio

- **React:** construcción de la interfaz.
- **Vite:** entorno de desarrollo y compilación.
- **TypeScript:** tipado estricto.
- **Tailwind CSS:** estilos y diseño responsive.
- **React Router:** navegación y protección de rutas.
- **Axios:** cliente HTTP y configuración de interceptores.
- **TanStack Query:** consultas, caché, sincronización y mutaciones del servidor cuando resulte útil.
- **React Hook Form:** gestión de formularios cuando su complejidad lo justifique.
- **Zod:** validación de formularios y datos cuando corresponda.
- **Socket.IO Client:** comunicación en tiempo real si el backend utiliza Socket.IO.
- **Lucide React:** iconografía consistente.
- **Geoapify + Leaflet + React:** mapas, según la decisión técnica del proyecto.
- **Vitest y React Testing Library:** pruebas unitarias y de componentes cuando estén configuradas.

No instales todas las dependencias automáticamente. Revisa primero las existentes y agrega únicamente las que necesite la implementación.

La configuración de Tailwind CSS debe respetar la versión instalada. Si el proyecto utiliza Tailwind CSS v4, configura su integración con Vite mediante `@tailwindcss/vite`, sin mezclar instrucciones de versiones anteriores.

## 3. Convenciones de idioma y nomenclatura

**Todas las carpetas deben tener nombres en inglés. El código propio del negocio, los archivos de funcionalidades y los textos de la interfaz deben estar en español.**

### Carpetas en inglés

Ejemplos:

- `src/`
- `app/`
- `router/`
- `layouts/`
- `pages/`
- `components/`
- `hooks/`
- `services/`
- `types/`
- `schemas/`
- `utils/`
- `constants/`
- `config/`
- `providers/`
- `assets/`
- `features/`

Los módulos funcionales también deben utilizar carpetas en inglés, por ejemplo:

- `authentication/`
- `dashboard/`
- `emergencies/`
- `ambulances/`
- `assignments/`
- `map/`
- `prehospital_care/`
- `reports/`
- `users/`
- `notifications/`
- `audit/`

### Archivos y código en español

Ejemplos:

- `pagina_emergencias.tsx`
- `pagina_mapa.tsx`
- `pagina_iniciar_sesion.tsx`
- `panel_emergencias.tsx`
- `tabla_ambulancias.tsx`
- `tarjeta_emergencia.tsx`
- `modal_asignar_ambulancia.tsx`
- `use_emergencias.ts`
- `use_ubicacion.ts`
- `emergencias.service.ts`
- `autenticacion.service.ts`
- `emergencia.types.ts`
- `emergencia.schema.ts`
- `formato_fecha.ts`

Los componentes React deben usar PascalCase:

- `PaginaEmergencias`
- `PanelEmergencias`
- `TarjetaEmergencia`
- `ModalAsignarAmbulancia`

Las variables y funciones deben usar camelCase en español:

- `emergenciasActivas`
- `ambulanciasDisponibles`
- `ubicacionSeleccionada`
- `obtenerEmergencias()`
- `asignarAmbulancia()`
- `actualizarEstadoEmergencia()`

Los nombres de archivos exigidos por las herramientas, como `main.tsx`, `index.html`, `vite.config.ts` o `tsconfig.json`, deben conservar sus convenciones oficiales.

No traduzcas nombres de APIs, propiedades externas ni contratos del backend si eso rompe la compatibilidad. Realiza la conversión a nombres del frontend en una capa de adaptación cuando sea necesario.

## 4. Arquitectura del frontend

Organiza la aplicación por funcionalidades, con separación de páginas, componentes, hooks, servicios y tipos.

Estructura orientativa:

```text
src/
├── app/
│   ├── proveedores.tsx
│   └── configuracion.ts
├── router/
│   ├── rutas.tsx
│   └── rutas_protegidas.tsx
├── layouts/
│   ├── diseño_principal.tsx
│   └── diseño_autenticacion.tsx
├── components/
│   ├── ui/
│   ├── formularios/
│   ├── tablas/
│   ├── modales/
│   └── estados/
├── hooks/
├── services/
│   ├── api.ts
│   ├── autenticacion.service.ts
│   └── socket.service.ts
├── providers/
├── types/
├── schemas/
├── utils/
├── constants/
├── config/
├── assets/
├── features/
│   ├── authentication/
│   ├── dashboard/
│   ├── emergencies/
│   ├── ambulances/
│   ├── assignments/
│   ├── map/
│   ├── prehospital_care/
│   ├── reports/
│   ├── users/
│   ├── notifications/
│   └── audit/
├── main.tsx
└── App.tsx
```

Cada funcionalidad debe agrupar lo que le pertenece. Por ejemplo:

```text
features/emergencies/
├── pages/
│   ├── pagina_emergencias.tsx
│   └── pagina_detalle_emergencia.tsx
├── components/
│   ├── tarjeta_emergencia.tsx
│   ├── tabla_emergencias.tsx
│   └── modal_registrar_emergencia.tsx
├── hooks/
│   └── use_emergencias.ts
├── services/
│   └── emergencias.service.ts
├── types/
│   └── emergencia.types.ts
└── schemas/
    └── emergencia.schema.ts
```

Esta estructura es orientativa, no una obligación de crear todos los archivos desde el primer día. Añade únicamente las carpetas necesarias.

No dupliques una funcionalidad entre `features/` y las carpetas globales. Los componentes globales deben ser verdaderamente reutilizables; los componentes específicos deben permanecer dentro de su funcionalidad.

## 5. Responsabilidades de cada capa

### Pages

Las páginas representan las vistas completas de la aplicación.

Deben organizar los componentes de la pantalla, coordinar los hooks necesarios y definir los estados de presentación.

No deben contener grandes bloques de lógica de negocio, solicitudes HTTP directas ni cálculos complejos que puedan reutilizarse.

### Components

Los componentes representan unidades de interfaz reutilizables o específicas de una funcionalidad.

Deben ser pequeños, tener responsabilidades claras y recibir mediante props los datos y acciones que necesitan.

Evita componentes gigantes que gestionen formularios, solicitudes, WebSockets, permisos y toda la interfaz al mismo tiempo.

### Hooks

Los hooks encapsulan lógica reutilizable de React, estado de interfaz y coordinación con servicios.

Ejemplos:

- `use_emergencias.ts`
- `use_ambulancias.ts`
- `use_asignaciones.ts`
- `use_ubicacion.ts`
- `use_autenticacion.ts`
- `use_permisos.ts`

No llames hooks condicionalmente ni fuera de componentes React u otros hooks.

Los hooks no deben convertirse en servicios gigantes. Separa la lógica de presentación, las consultas del servidor y las operaciones de infraestructura cuando sea necesario.

### Services

Los servicios contienen las operaciones de comunicación con el backend.

Ejemplos:

- `autenticacion.service.ts`
- `emergencias.service.ts`
- `ambulancias.service.ts`
- `asignaciones.service.ts`
- `reportes.service.ts`

Los servicios deben centralizar las solicitudes HTTP, utilizar el cliente Axios configurado y definir tipos claros para entradas y respuestas.

No implementes solicitudes Axios directamente en cada componente.

### Types y schemas

`types/` contiene tipos e interfaces de TypeScript.

`schemas/` contiene esquemas de validación cuando corresponda.

Los tipos deben representar los contratos de la API y los modelos utilizados por la interfaz. Evita duplicaciones y define conversiones explícitas cuando los datos del backend tengan una representación diferente.

## 6. Configuración de API y Axios

Centraliza la configuración HTTP en un cliente compartido.

El cliente debe contemplar:

- URL base mediante variables de entorno.
- Encabezados comunes.
- Serialización coherente.
- Manejo centralizado de errores.
- Envío de credenciales o token según el mecanismo de autenticación definido.
- Tratamiento controlado de respuestas `401`, `403`, `404`, `409` y errores de servidor.
- Tipado de solicitudes y respuestas.

Utiliza variables de entorno de Vite, como `VITE_API_URL`, para la URL pública del backend.

Nunca incluyas contraseñas, claves privadas, secretos JWT ni credenciales administrativas en variables `VITE_*`: sus valores se exponen al código del navegador.

No dupliques el manejo de errores en cada página ni ocultes los errores devolviendo datos ficticios como si fueran reales.

## 7. Autenticación JWT y autorización

La autenticación debe integrarse con el backend NestJS.

Implementa:

- Pantalla de inicio de sesión.
- Manejo del estado de autenticación.
- Rutas protegidas.
- Cierre de sesión.
- Gestión de expiración del token.
- Control de acceso a vistas y acciones según los permisos recibidos del backend.
- Redirecciones coherentes después del inicio o cierre de sesión.

La interfaz puede ocultar botones o restringir la navegación según los permisos, pero **el backend siempre es responsable de autorizar las operaciones**.

No almacenes información sensible innecesaria en `localStorage` ni guardes contraseñas. Para la gestión de tokens, utiliza el mecanismo acordado con el backend. Si se utiliza una cookie `HttpOnly`, no intentes leerla desde JavaScript; si se utiliza un token accesible desde JavaScript, evalúa los riesgos de XSS y evita una persistencia insegura.

No implementes refresh tokens en el frontend hasta que el backend soporte correctamente ese flujo.

Los errores de autenticación deben manejarse sin entrar en ciclos infinitos de redirección ni ejecutar múltiples cierres de sesión simultáneos.

## 8. Diseño visual y experiencia de usuario

La plataforma debe priorizar la rapidez de lectura y la claridad operativa, especialmente durante la gestión de emergencias.

Principios:

- Interfaz limpia y profesional.
- Jerarquía visual clara.
- Diseño responsive para escritorio, tablet y pantallas de menor tamaño.
- Navegación consistente.
- Estados de carga, error, vacío y éxito.
- Formularios accesibles y fáciles de completar.
- Confirmaciones para operaciones críticas.
- Mensajes de error comprensibles.
- Contraste adecuado y uso consistente de colores.

Utiliza una identidad visual coherente para los estados operativos, sin depender exclusivamente del color para comunicar información.

Los estados de emergencia y de las ambulancias deben diferenciarse con etiquetas, iconos y texto. Evita animaciones innecesarias o efectos que distraigan al operador.

### Regla para diseños existentes

Si ya existe un diseño funcional, **conserva su estructura visual, distribución, colores, tipografías, espaciados y comportamiento**.

No rediseñes toda la aplicación por iniciativa propia. Realiza únicamente los cambios necesarios para incorporar las nuevas funcionalidades y mantener la coherencia visual.

Si una mejora visual importante exige cambiar el diseño existente, justifica la necesidad antes de realizar una modificación amplia.

## 9. Módulos funcionales de la plataforma

La plataforma debe organizarse de acuerdo con las funcionalidades que realmente se definan para el proyecto.

### Dashboard

Debe presentar información operativa relevante:

- Emergencias activas.
- Ambulancias disponibles, ocupadas y fuera de servicio.
- Asignaciones pendientes.
- Servicios en curso.
- Indicadores resumidos.
- Alertas operativas relevantes.

No inventes datos de ejemplo en producción ni muestres estadísticas calculadas sobre información incompleta sin indicarlo.

### Emergencias

Debe permitir:

- Consultar y filtrar emergencias.
- Registrar una emergencia cuando el usuario tenga permisos.
- Consultar el detalle y su estado actual.
- Revisar reportes relacionados con una misma emergencia.
- Consultar el historial de cambios.
- Identificar posibles duplicados según la respuesta del backend.
- Gestionar las acciones permitidas según el estado y los permisos.

Las reglas de negocio y la detección definitiva de duplicados deben resolverse en el backend.

### Mapa y ambulancias

Debe presentar:

- Ubicación conocida de las ambulancias.
- Estado operativo.
- Emergencias y asignaciones relevantes.
- Información resumida al seleccionar un elemento.
- Actualizaciones en tiempo real.
- Indicadores de ubicación desactualizada o no disponible.

No muestres una ubicación como actual si el dato recibido es antiguo. Diferencia entre una ambulancia sin conexión, una ubicación desactualizada y una ambulancia realmente fuera de servicio.

No calcules ni inventes tiempos estimados de llegada en el frontend. Utiliza datos de un proveedor o del backend y presenta claramente su naturaleza cuando corresponda.

### Asignaciones

Debe permitir consultar las asignaciones y ejecutar las acciones autorizadas.

Antes de confirmar una acción crítica, muestra el contexto necesario y solicita confirmación cuando corresponda.

Actualiza la interfaz con la respuesta del servidor. No consideres definitiva una asignación solo porque el usuario pulsó un botón.

Controla los conflictos, como una ambulancia que ya no está disponible, y presenta una opción para actualizar la información.

### Atención prehospitalaria

Debe mostrar los registros a los usuarios autorizados.

Los formularios deben validar los datos y presentar claramente los campos obligatorios. No permitas que un usuario sin autorización consulte o modifique datos clínicos.

Las correcciones deben respetar las reglas del backend y no borrar silenciosamente el historial clínico.

### Reportes y estadísticas

Debe permitir filtrar la información por criterios admitidos por la API, mostrar estados de carga y error y presentar visualizaciones legibles.

No calcules indicadores clínicos u operativos importantes utilizando únicamente datos parciales del navegador si el backend dispone de un cálculo oficial.

### Usuarios, notificaciones y auditoría

La administración de usuarios, la consulta de notificaciones y los registros de auditoría deben respetar los permisos del usuario autenticado.

Las notificaciones no deben mostrar información clínica o personal a usuarios no autorizados.

## 10. Mapas y geolocalización

La implementación del mapa debe estar desacoplada de la lógica de emergencias.

Utiliza el proveedor de mapas seleccionado para el proyecto y mantén separadas las responsabilidades de:

- Renderizado cartográfico.
- Marcadores de ambulancias.
- Marcadores de emergencias.
- Geocodificación.
- Cálculo de rutas.
- Estimación del tiempo de llegada.

No acoples toda la aplicación a Google Maps, MapLibre u otro proveedor específico. Cuando tenga sentido, utiliza una capa de adaptación para facilitar cambios de proveedor.

Para las ubicaciones en tiempo real:

- Actualiza los marcadores mediante los eventos recibidos.
- Evita reconstruir todo el mapa con cada actualización GPS.
- Controla la frecuencia de renderizado.
- Elimina listeners y suscripciones al desmontar los componentes.
- Gestiona desconexiones, reconexiones y ubicaciones desactualizadas.
- No solicites permisos de ubicación al operador si la funcionalidad no los necesita.

El frontend web debe mostrar las ubicaciones de las ambulancias autorizadas. El seguimiento GPS del dispositivo móvil de la tripulación pertenece a la aplicación móvil y al backend correspondiente.

## 11. WebSockets y tiempo real

Utiliza el cliente compatible con el protocolo del backend.

Los eventos en tiempo real pueden incluir:

- Nueva emergencia.
- Actualización de emergencia.
- Nueva asignación.
- Cambio de estado de ambulancia.
- Actualización de ubicación.
- Cambio en un servicio activo.
- Notificación operativa.

Reglas:

- Centraliza la configuración de la conexión.
- Autentica la conexión según el mecanismo acordado con el backend.
- Controla los estados conectado, desconectado y reconectando.
- Evita registrar el mismo listener varias veces.
- Retira los listeners cuando ya no sean necesarios.
- Valida la estructura de los eventos recibidos.
- Evita sobrescribir información reciente con eventos antiguos.
- Reconcilia el estado con la API después de una reconexión cuando sea necesario.
- No envíes información sensible a canales generales.
- No confíes en que ocultar un evento en la interfaz constituye una autorización.

Utiliza los eventos para mantener la interfaz actualizada. No sustituyas indiscriminadamente todas las consultas REST por WebSockets.

## 12. Estado y caché

Utiliza las herramientas según su responsabilidad.

- Estado local de React para interacciones pequeñas de la interfaz.
- TanStack Query para consultas, caché, invalidación y mutaciones del servidor.
- Context API para información compartida que realmente lo necesite, como la sesión.
- Una biblioteca adicional de estado global solo cuando exista una necesidad real.

No mantengas copias independientes y desincronizadas de la misma información en varios componentes.

Después de una mutación, actualiza o invalida las consultas afectadas. En operaciones críticas, utiliza como fuente definitiva la respuesta confirmada del backend.

Evita utilizar `useEffect` para todo. Prefiere las herramientas adecuadas para consultas, eventos, estado derivado y acciones de usuario.

## 13. Formularios y validaciones

Los formularios deben:

- Definir tipos claros.
- Validar los campos obligatorios.
- Mostrar errores junto al campo correspondiente.
- Evitar envíos repetidos.
- Deshabilitar acciones mientras una operación no pueda repetirse de forma segura.
- Mostrar el resultado real de la operación.
- Mantener la información ingresada cuando ocurra un error recuperable.

Utiliza React Hook Form y Zod cuando aporten valor. No dupliques reglas complejas del backend en el frontend.

La validación del cliente mejora la experiencia, pero el backend sigue siendo la autoridad final.

## 14. Manejo de errores y estados de interfaz

Toda vista que dependa de información remota debe contemplar:

- Carga inicial.
- Carga de actualización cuando sea necesaria.
- Estado vacío.
- Error de consulta.
- Error de permisos.
- Datos desactualizados cuando corresponda.
- Éxito o confirmación de una mutación.

No muestres tablas vacías mientras una consulta está cargando como si no existieran registros.

No reemplaces errores reales por listas vacías. No uses alertas nativas del navegador como solución general para todos los mensajes; utiliza componentes de notificación consistentes.

Las operaciones críticas deben tener mensajes claros y no indicar éxito hasta recibir confirmación del servidor.

## 15. Seguridad del frontend

- No incluyas secretos en el código del navegador.
- No confíes en los permisos de la interfaz para proteger datos.
- Evita renderizar HTML no confiable.
- No desactives controles de seguridad para resolver errores de integración.
- No expongas información clínica innecesaria.
- Evita guardar información sensible en almacenamiento persistente del navegador.
- No registres tokens, contraseñas ni respuestas clínicas completas en la consola.
- Protege los formularios y flujos de autenticación de acuerdo con el mecanismo implementado por el backend.
- Utiliza HTTPS en producción.
- Mantén las dependencias actualizadas y evita paquetes innecesarios.

## 16. Calidad del código

- Utiliza TypeScript estricto.
- No utilices `any`.
- Evita conversiones de tipo inseguras y el uso indiscriminado de `!`.
- Define tipos explícitos para props, respuestas y eventos relevantes.
- Evita duplicar lógica.
- No crees componentes gigantes.
- No conviertas cada elemento visual en una abstracción sin necesidad.
- No concentres todas las solicitudes, reglas y estados en una sola página.
- Mantén separados los servicios, hooks y componentes.
- Utiliza las convenciones del proyecto para los nombres y la organización.
- Evita comentarios redundantes.
- No utilices datos simulados como sustitutos silenciosos del backend real.

## 17. Pruebas

Implementa pruebas según la criticidad de cada funcionalidad.

Prioriza:

- Inicio y cierre de sesión.
- Protección de rutas.
- Control de permisos en la interfaz.
- Formularios de creación y edición.
- Errores de la API.
- Asignación y cambios de estado.
- Renderizado del mapa.
- Eventos WebSocket y reconexión.
- Manejo de datos desactualizados.
- Presentación de información sensible según los permisos.

Utiliza Vitest y React Testing Library cuando estén configurados en el proyecto. No afirmes que las pruebas pasan si no las ejecutaste.

## 18. Variables de entorno y despliegue

Utiliza archivos de entorno para configurar el proyecto por ambiente.

Ejemplo:

```env
VITE_API_URL=
VITE_SOCKET_URL=
```

Agrega variables adicionales solo si el proyecto las necesita.

No almacenes credenciales secretas en variables de Vite ni incluyas archivos `.env` con valores reales en el repositorio.

Mantén scripts claros para desarrollo, compilación, lint y pruebas.

Antes de entregar un cambio, comprueba la compilación y ejecuta las verificaciones disponibles.

## 19. Forma de trabajo de Claude

Antes de implementar cualquier funcionalidad:

1. Inspecciona el repositorio y su estructura.
2. Revisa `package.json`, Vite, TypeScript, Tailwind CSS y las dependencias existentes.
3. Identifica el diseño actual y respétalo.
4. Revisa los contratos y endpoints del backend antes de inventar estructuras de datos.
5. Define qué página, componentes, hooks, servicios y tipos son realmente necesarios.
6. Implementa el cambio con el menor alcance razonable.
7. Reutiliza componentes y estilos existentes.
8. Ejecuta lint, pruebas y compilación cuando estén disponibles.
9. Informa qué archivos cambiaste y qué verificaciones ejecutaste.

No reescribas toda la aplicación por una funcionalidad pequeña. No cambies rutas, estilos globales, dependencias o arquitectura sin una razón justificada.

Si el backend todavía no implementa un endpoint, informa la dependencia pendiente. No inventes una respuesta y la presentes como si fuera real.

**Regla principal:** construir una interfaz operativa, segura y mantenible, con carpetas en inglés, código propio del negocio en español y separación clara entre páginas, componentes, hooks y servicios. La interfaz debe reflejar fielmente el estado confirmado por el backend y nunca reemplazar sus reglas de negocio.