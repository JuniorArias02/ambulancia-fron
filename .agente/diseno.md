# DIRECTRICES AVANZADAS DE DISEÑO UI/UX — AMBULANCIA

## 1. Objetivo visual

Diseña **AMBULANCIA** como una plataforma empresarial de nueva generación, especializada en la gestión de ambulancias, despacho de emergencias, coordinación operativa y atención prehospitalaria.

La interfaz debe transmitir profesionalismo médico, precisión, confianza, rapidez operativa y control. Inspírate en la calidad visual de productos como Linear, Stripe y Vercel, adaptando sus patrones al contexto crítico de los servicios de ambulancia.

No quiero un dashboard genérico construido con tarjetas repetitivas. Quiero un producto con identidad visual propia, excelente distribución del espacio, jerarquía visual clara, componentes consistentes y una experiencia diseñada para operadores de despacho, conductores, paramédicos, coordinadores y personal administrativo.

**La prioridad es crear un diseño extremadamente moderno, elegante y profesional, sin sacrificar la funcionalidad ni la rapidez de uso.**

## 2. Identidad visual

Utiliza un sistema de diseño coherente con esta paleta:

- Fondo general: `#F5F7FA`.
- Superficies principales: `#FFFFFF`.
- Texto principal: `#172033`.
- Texto secundario: `#64748B`.
- Bordes: `#E2E8F0`.
- Azul primario: `#2563EB`.
- Azul oscuro institucional: `#101B2D`.
- Cian de apoyo: `#06B6D4`.
- Verde para estados satisfactorios: `#16A34A`.
- Ámbar para advertencias: `#D97706`.
- Rojo crítico: `#DC2626`.

Utiliza los colores con intención. El azul debe identificar las acciones principales y los elementos activos; el rojo debe reservarse para emergencias críticas y acciones destructivas; los colores semánticos deben comunicar estados reales.

La aplicación utiliza **exclusivamente modo claro**, incluso si el sistema operativo o el navegador del usuario prefieren el modo oscuro. No implementes temas oscuros ni variantes `dark:`.

Los paneles de marca o institucionales también deben ser claros: utiliza superficies de vidrio blanco o tintes azules muy suaves, y reserva el azul oscuro institucional `#101B2D` para detalles puntuales como textos destacados, no para fondos de secciones completas.

## 2.1. Lenguaje visual: Light Glassmorphism

El estilo oficial de la aplicación es **Light Glassmorphism**: superficies translúcidas claras sobre un fondo ambiental suave, con una sensación limpia, serena y premium.

### Fondo ambiental

- Base `#F3F6FB` con manchas de color muy difusas (azul primario, cian y un toque lavanda) a baja opacidad (8–16 %).
- El fondo es fijo y tranquilo: nunca animado, saturado ni con patrones llamativos.
- Su propósito es dar profundidad al vidrio; no debe competir con el contenido.

### Superficies de vidrio

- Vidrio estándar: blanco al 60–70 % de opacidad, desenfoque de 16–24 px y saturación suave.
- Vidrio fuerte (menús desplegables, cajones móviles, paneles sobre el mapa): blanco al 80–85 %.
- Borde de 1 px blanco al 70 % y un brillo interior superior sutil.
- Sombras amplias, difusas y de baja opacidad (azul institucional al 6–10 %). Nunca sombras duras.
- Radios generosos: 16 px en paneles, 12 px en controles y 8 px en elementos pequeños.
- Usa las utilidades compartidas (`vidrio`, `vidrio-fuerte`) en lugar de repetir valores sueltos.
- Si el navegador no soporta `backdrop-filter`, las superficies pasan a blanco casi opaco.

### Reglas de uso

- El texto sobre vidrio debe mantener contraste AA: usa siempre los tokens de texto, nunca grises más claros que `#64748B`.
- No apiles más de dos capas de vidrio una sobre otra.
- Los colores semánticos (verde, ámbar, rojo) se aplican como tintes suaves con texto e icono legibles; nunca como fondos saturados.
- El vidrio se aplica a la estructura (sidebar, barra superior, paneles flotantes y formularios). Las tablas y los listados densos usan vidrio fuerte o superficies casi opacas para priorizar la lectura.
- Limita la cantidad de elementos con desenfoque simultáneos por rendimiento, especialmente sobre el mapa.

## 3. Tipografía y jerarquía visual

Utiliza **Inter** como fuente principal.

- Títulos de página: 24–30 px, peso 600–700.
- Títulos de sección: 16–20 px, peso 600.
- Texto general: 14–16 px.
- Metadatos: 12–13 px, manteniendo una legibilidad adecuada.
- Indicadores operativos: 24–32 px cuando su importancia lo justifique.

Mantén una jerarquía visual clara mediante tamaños, pesos, contrastes y espaciados. Evita mezclar múltiples tipografías sin necesidad.

## 4. Composición y layout

Construye una interfaz empresarial con:

- Sidebar lateral persistente, compactable y con navegación agrupada.
- Barra superior limpia, con contexto de navegación, búsqueda, notificaciones y perfil.
- Área de contenido amplia y bien organizada.
- Paneles laterales contextuales cuando aporten valor.
- Formularios estructurados en secciones.
- Tablas compactas y legibles.
- Estados vacíos, cargas, errores y confirmaciones cuidadosamente diseñados.

Utiliza un sistema de espaciado basado en múltiplos de 4 px, priorizando 8, 12, 16, 24 y 32 px.

Evita convertir cada elemento en una tarjeta. Combina tablas, listas, paneles, divisores y espacios abiertos de manera intencional. Cada componente debe tener una función visual y operativa.

## 5. Iconografía obligatoria: Lucide React

Utiliza exclusivamente **Lucide React (`lucide-react`)** para todos los iconos de la interfaz.

Reglas obligatorias:

- Tamaño estándar: 18–20 px.
- Tamaño pequeño: 14–16 px.
- Tamaño destacado: 22–24 px.
- Grosor de trazo consistente, generalmente entre 1.75 y 2 px.
- Alineación y proporciones uniformes.
- Un mismo icono para representar un mismo concepto en toda la aplicación.
- Nada de emojis, iconos Unicode ni mezclas de bibliotecas.
- No crees iconos improvisados cuando exista uno adecuado en Lucide.
- Las acciones principales deben incluir etiquetas de texto claras.
- Los botones de solo icono deben tener nombres accesibles y tooltips cuando sea necesario.

Ejemplos de iconos apropiados:

- `LayoutDashboard`: panel principal.
- `RadioTower`: centro de operaciones.
- `Siren`: emergencias.
- `Ambulance`: flota.
- `MapPin`: ubicaciones.
- `Map`: mapa operativo.
- `Users`: personal y equipos.
- `CalendarClock`: turnos.
- `ClipboardList`: reportes.
- `HeartPulse`: atención prehospitalaria.
- `Activity`: signos vitales.
- `Hospital`: instituciones.
- `FileText`: historias clínicas y documentos.
- `FileSignature`: firmas y consentimientos.
- `Bell`: notificaciones.
- `ShieldCheck`: seguridad y permisos.
- `Settings2`: configuración.
- `History`: historial de actividad.
- `Search`: búsqueda.
- `Filter`: filtros.
- `Ellipsis`: acciones adicionales.

Verifica que los iconos utilizados existan en la versión instalada de Lucide React. No utilices nombres inventados ni sustituyas iconos faltantes por emojis.

## 6. Componentes modernos y consistentes

### Botones

- Primarios: fondo azul y texto blanco.
- Secundarios: estilos neutros o bordes sutiles.
- Terciarios: discretos y compactos.
- Destructivos: rojos, con confirmación cuando corresponda.
- Estados claros para hover, focus, active, disabled y loading.

### Formularios

- Etiquetas visibles.
- Campos agrupados por contexto.
- Validación clara y mensajes de error junto al campo.
- Indicadores de obligatoriedad.
- Autocompletado y búsqueda en catálogos extensos.
- Confirmación antes de perder cambios no guardados.

### Tablas

- Encabezados diferenciados.
- Filas compactas pero legibles.
- Separadores sutiles.
- Filtros, ordenamiento y paginación cuando correspondan.
- Acciones contextuales por registro.
- Estados vacíos y de carga bien diseñados.

### Badges y estados

Utiliza etiquetas compactas con fondos suaves y texto legible. No dependas exclusivamente del color: acompaña los estados con texto y, cuando aporte valor, iconografía.

### Tarjetas y métricas

No repitas el mismo patrón en todas las secciones. Usa tarjetas para indicadores relevantes, listas para actividades, tablas para registros y paneles para información contextual.

No inventes estadísticas, tendencias ni datos para llenar espacio.

## 7. Centro de operaciones

El centro de operaciones debe sentirse como una herramienta profesional de coordinación en tiempo real.

Prioriza visualmente:

1. Emergencias activas y pendientes de asignación.
2. Disponibilidad y ubicación de ambulancias.
3. Asignaciones en curso.
4. Alertas que requieren atención.
5. Actividad operativa reciente.

El mapa debe ocupar suficiente espacio para resultar útil. Utiliza marcadores que se diferencien por forma, símbolo y color. Al seleccionar una ambulancia o emergencia, muestra sus detalles en un panel contextual sin ocultar innecesariamente el mapa.

Distingue los datos actuales de los históricos, simulados o desactualizados. No simules GPS, rutas ni actualizaciones en tiempo real si esas capacidades no existen en el backend.

## 8. Atención prehospitalaria

La historia clínica prehospitalaria debe ofrecer una experiencia rápida, clara y apropiada para trabajar bajo presión.

Organiza los formularios en secciones lógicas según el modelo de datos existente: identificación, motivo de atención, valoración, signos vitales, intervenciones, traslado y entrega del paciente, según corresponda.

Mantén visibles el estado del registro y la información esencial del caso. Diferencia los campos editables de la información consultada y los registros históricos.

Optimiza la interfaz para tablets y móviles. Evita formularios interminables, modales innecesarios y elementos decorativos que retrasen la atención.

No inventes valores clínicos, diagnósticos, protocolos ni datos de pacientes.

## 9. Microinteracciones

Utiliza animaciones sutiles y funcionales, generalmente entre 120 y 200 ms, con un máximo habitual de 300 ms.

Aplica movimiento únicamente cuando facilite la comprensión de una transición, la apertura de un panel o la confirmación de una acción.

Evita rebotes exagerados, animaciones constantes, efectos innecesarios y movimientos que distraigan al operador.

## 10. Elementos prohibidos

- Glassmorphism oscuro, con neón o con desenfoques exagerados que reduzcan la legibilidad.
- Gradientes intensos o animados; solo se permite el fondo ambiental suave descrito en la sección 2.1.
- Sombras exageradas.
- Fondos saturados en secciones completas.
- Vidrio sobre vidrio en más de dos capas.
- Estética de videojuego o efectos neón.
- Tarjetas repetitivas para todo.
- Iconos de diferentes bibliotecas.
- Emojis como iconos de interfaz.
- Botones excesivamente grandes.
- Espacios vacíos sin justificación.
- Texto demasiado pequeño.
- Tablas sobrecargadas de bordes.
- Formularios interminables en una sola columna.
- Modales innecesarios.
- Gráficos decorativos sin utilidad.
- Información crítica escondida detrás de demasiados clics.
- Funcionalidades ficticias presentadas como reales.

## 11. Diseño adaptable y accesibilidad

La aplicación debe funcionar correctamente en monitores, portátiles, tablets y móviles.

En escritorio, aprovecha el espacio para las operaciones simultáneas. En tablets, reorganiza formularios y paneles para facilitar el uso táctil. En móviles, prioriza las tareas esenciales y adapta tablas, navegación y acciones.

Mantén un contraste adecuado, navegación por teclado, indicadores de foco, etiquetas accesibles y áreas de interacción cómodas.

## 12. Instrucción final para la IA

Antes de implementar el diseño, inspecciona el proyecto existente, su estructura, las tecnologías utilizadas, los componentes disponibles y el modelo de datos.

Respeta la arquitectura actual y reutiliza los componentes cuando corresponda. No inventes endpoints, campos, permisos ni funcionalidades del backend.

El resultado debe parecer un **producto empresarial real, moderno, premium y listo para evolucionar a producción**, no una plantilla administrativa genérica.

Prioriza la calidad visual, la consistencia, la usabilidad, la densidad informativa bien resuelta y la iconografía de Lucide React. Cada pantalla debe tener una composición propia, diseñada según su propósito operativo.

No te limites a cambiar colores o redondear bordes: mejora de forma integral la composición, la jerarquía, la navegación, los componentes y la experiencia de usuario.