# AMBULANCIA: contexto del sistema

Qué hace la plataforma, quién la usa y qué reglas de negocio sigue cada módulo de la web.
Las reglas de cómo construir el frontend están en [`../arquitectura.md`](../arquitectura.md) y las de diseño en [`../diseno.md`](../diseno.md). Los contratos exactos de la API están en Swagger del backend (`/api/docs`).

---

## 1. Qué es

Plataforma para operar un servicio de ambulancias: recibir emergencias, despachar ambulancias, seguirlas en el mapa, atender al paciente con una historia clínica prehospitalaria y controlar el inventario de cada vehículo.

| Pieza | Quién la usa | Para qué |
| --- | --- | --- |
| **Web** (este proyecto, React) | Administrador y despachador (la "central") | Despacho, flota, inventario, consulta clínica y administración |
| **App móvil** (Flutter) | Conductor, paramédico y ciudadano | Tripulación: elegir ambulancia, avanzar el servicio, GPS, historia clínica, inventario de a bordo. Ciudadano: reportar emergencias |
| **API** (NestJS) | Todos | Fuente de verdad: valida, autoriza, cambia estados y audita |
| **Tiempo real** (Socket.IO, servidor aparte) | Web y app | Solo avisa cambios; las acciones siempre van por la API |

El backend decide los estados de las emergencias, las ambulancias y los servicios. La web nunca los fuerza; muestra lo que el backend confirma.

---

## 2. Roles

Cada usuario tiene **un solo rol**.

| Rol | Dónde trabaja | Qué hace |
| --- | --- | --- |
| **Administrador** | Web | Todo lo del despachador, más: usuarios, verificación de ciudadanos, listas de chequeo, firmas de los profesionales, instituciones de salud y el módulo de historias clínicas |
| **Despachador** | Web | Recibe y registra emergencias, despacha ambulancias, sigue los servicios, gestiona la flota y el inventario. Recibe las alertas |
| **Paramédico** | App | Atiende al paciente, llena y firma la historia clínica, registra consumos y verificaciones de inventario de su ambulancia. Puede ir como "paramédico" o "médico" en la tripulación |
| **Conductor** | App | Conduce, hace el chequeo diario del vehículo y es el **único** que confirma la llegada a la escena (con GPS) |
| **Ciudadano** | App | Se registra solo, verifica su identidad con fotos del documento y, una vez aprobado, reporta emergencias |

- El ciudadano **no** es personal: no se crea ni se le asigna rol desde la web, y no puede convertirse en personal.
- El paramédico y el conductor pueden iniciar sesión en la web, pero solo ven el mapa de inicio, las instituciones y su perfil.

### Qué ve cada rol en la web

| Módulo | Administrador | Despachador | Paramédico / conductor |
| --- | --- | --- | --- |
| Inicio (centro de operaciones con mapa) | ✅ | ✅ | Solo el mapa base |
| Emergencias, Servicios en curso | ✅ | ✅ | — |
| Tripulaciones, Ambulancias, Chequeos diarios | ✅ | ✅ | — |
| Inventario (todo el módulo) | ✅ | ✅ | — |
| Instituciones de salud | ✅ crea y edita | ✅ consulta | ✅ consulta |
| Historias clínicas, Pacientes, Indicadores | ✅ | — | — |
| Usuarios, Verificación de ciudadanos, Listas de chequeo | ✅ | — | — |
| Mi perfil | ✅ | ✅ | ✅ |

Ocultar un menú es solo experiencia de usuario: el backend responde `403` a quien no tiene permiso.

---

## 3. El recorrido de un servicio

1. **Llega la emergencia**: por línea 123, teléfono o radio (la registra el despachador) o desde la app de un ciudadano verificado. Queda `recibida`, con un número `EMG-AAAAMMDD-NNNN`.
2. **Posibles duplicadas**: el sistema sugiere llamadas parecidas (cerca, misma dirección, mismo tipo). El despachador decide si la marca como duplicada de otra.
3. **Despacho**: la central elige una ambulancia `disponible` (tiene tripulación completa). La ambulancia pasa a `en_servicio` y la emergencia a `despachada`. Una emergencia puede recibir varias ambulancias (varias víctimas).
4. **Ruta**: el backend calcula el camino por calles hasta la emergencia y lo recalcula si la ambulancia se desvía. La web solo la dibuja.
5. **Avance del servicio** (lo marca la tripulación desde la app; la central puede marcar algunos pasos):
   `asignada → en_camino → en_escena → atendiendo → trasladando → finalizada`
   - "Llegué" (`en_escena`) solo lo confirma el **conductor**, con GPS. Si está lejos de la escena debe justificarlo y queda marcado "fuera de radio".
   - Al llegar, la emergencia pasa a `en_atencion`.
   - Se puede finalizar sin traslado (desde la escena o atendiendo) con un motivo.
   - Se puede **cancelar** solo en `asignada` o `en_camino`, con motivo. Si era el único servicio, la emergencia vuelve a `recibida`.
6. **Historia clínica**: el paramédico la abre y la llena en la app (paciente, valoración, signos vitales, lesiones, procedimientos, riesgo de caídas, entrega) y la **cierra firmando**.
7. **Cierre**: al finalizar, la ambulancia vuelve a `disponible` y la emergencia queda `cerrada` cuando terminan todos sus servicios.

---

## 4. Módulos de la web

### 4.1 Inicio: centro de operaciones
Mapa a pantalla completa con las emergencias activas y la flota en vivo, las rutas de las ambulancias en camino y paneles con lo pendiente de despachar.
- Marcadores por estado: disponible (verde), en servicio (azul), fuera de servicio (gris), mantenimiento (naranja).
- La antigüedad del GPS importa: menos de 2 min normal, de 2 a 10 min semitransparente, más de 10 min gris ("sin señal").
- Cuando todas las ambulancias de una emergencia ya llevan al paciente (`trasladando`), la emergencia se atenúa: ya no hay paciente en el sitio.

### 4.2 Emergencias
Registrar, editar, cancelar y consultar emergencias, con vista de activas e historial.
- **Datos**: fuente, descripción, informante, tipo de incidente, prioridad (roja, amarilla, verde), **tipo de servicio (modalidad)**, ubicación y número de víctimas.
- **Ubicación obligatoria**: dirección o punto en el mapa. La dirección se geocodifica en el backend (la web nunca llama al proveedor de mapas). Si el resultado es aproximado o solo de zona, se avisa y se pide confirmar.
- **Estados** (solo lectura): `recibida`, `despachada`, `en_atencion` (activas), `cerrada`, `cancelada`.
- **Tipo de servicio** (modalidad): emergencia (por defecto), accidente de tránsito, traslado programado, traslado entre instituciones, atención en sitio. **No es el tipo de ambulancia**: define qué firmas exige la historia clínica. Se puede cambiar mientras la emergencia esté activa y nunca queda vacío.
- Una emergencia reportada desde la app por un ciudadano se identifica como tal.

### 4.3 Servicios en curso (asignaciones)
Lista de las ambulancias despachadas con su etapa, tiempo transcurrido y acciones según lo que el backend permite en ese momento. Incluye la línea de tiempo de cada servicio (quién marcó cada paso y cuándo) y su recorrido GPS.

### 4.4 Tripulaciones (turnos)
**Solo consulta.** La tripulación la arman el conductor y el paramédico **desde la app**, eligiendo su ambulancia.
- La ambulancia pasa sola a `disponible` cuando la tripulación queda completa y a `fuera_servicio` cuando queda incompleta.
- La central puede **cerrar un turno** que quedó abierto (alguien olvidó salir o perdió el celular). No se puede si la ambulancia está en servicio.
- Una misma jornada puede verse como varios turnos: si cambia la tripulación después de atender, se cierra uno y empieza otro, para saber quién atendió cada servicio.

### 4.5 Ambulancias (flota)
Registro, edición y estado operativo de cada vehículo, con su historial de cambios y su tripulación actual.
- Código y placa únicos (se guardan en mayúsculas; la placa sin espacios ni guiones).
- Tipos: **TAB** (básico) y **TAM** (medicalizado).
- Una ambulancia nueva nace `fuera_servicio`.
- **Cambios a mano** entre `disponible`, `fuera_servicio` y `mantenimiento`. Pasar a `disponible` exige tripulación completa.
- `en_servicio` solo lo pone y lo quita el despacho: una ambulancia en servicio no se edita ni cambia de estado a mano.
- Cada cambio queda en el historial con motivo y responsable.

### 4.6 Chequeo diario y listas de chequeo
- **Listas de chequeo** (administrador): la lista de preguntas y opciones (por ejemplo Bien, Regular, Estable) que el conductor responde cada día sobre el vehículo.
  - Solo una lista activa a la vez.
  - Nada se borra: preguntas y opciones se desactivan.
  - El texto de una pregunta ya respondida no cambia: se desactiva y se crea otra.
- **Chequeos diarios** (administrador y despachador): historial de lo que revisó cada conductor en cada ambulancia, día por día, con observaciones.

### 4.7 Inventario
Administrador y despachador tienen los mismos permisos. Lo que pasa **dentro** de la ambulancia (consumos, conteos) lo hace el paramédico en la app; la web lo consulta.
- **Catálogo de insumos**: medicamentos, dispositivos, insumos asistenciales, equipos biomédicos, oxígeno. Cada insumo se controla de una forma:
  - **por lote**: trazabilidad y vencimiento (medicamentos, soluciones, gasas estériles);
  - **por serie**: una unidad a la vez (monitores, desfibriladores);
  - **sin lote ni serie**: solo cantidad.
  - Una vez tiene movimientos, la forma de control no se cambia. Puede tener stock mínimo, registro sanitario y marca de control especial.
- **Registros sanitarios** (INVIMA): si el insumo los exige, sus lotes y equipos deben tener uno vigente.
- **Bodegas y ubicaciones**: las bodegas y las ambulancias son ubicaciones de inventario. Una bodega inactiva no recibe ni entrega.
- **Lotes y equipos**: crear un lote no suma existencias (eso lo hace una entrada). Un equipo no operativo no puede ir a una ambulancia; la baja es definitiva. Los equipos llevan historial de mantenimientos (preventivo, correctivo, calibración).
- **Movimientos**: entrada, transferencia (abastecer una ambulancia), ajuste, baja, devolución (de la ambulancia a la bodega) y consumo (lo registra el paramédico). Pueden quedar en borrador o confirmarse; los confirmados se anulan, no se borran.
- **Perfiles de dotación** por tipo de ambulancia, con versiones: qué debe tener cada ambulancia. La web muestra qué le falta a cada una y permite abastecerla.
- **Existencias, alertas** (bajo mínimo, por vencer, vencidos, mantenimientos) y **controles de temperatura y humedad**.
- **Verificaciones**: el paramédico cuenta lo que hay a bordo (inicio o fin de turno, o extraordinaria). Si hay faltantes, sobrantes, vencidos o dañados queda "con novedades". La central corrige con movimientos y luego **marca la verificación como revisada**, dejando constancia de cómo se resolvió (la revisión no mueve existencias). El menú muestra cuántas faltan por revisar.

### 4.8 Instituciones de salud
Hospitales y clínicas de destino. El administrador las crea, edita y activa o inactiva (no se borran); todos los roles las consultan. Tienen código REPS, nivel de complejidad (baja, mediana, alta) y ubicación, y se pueden ordenar por cercanía.

### 4.9 Historias clínicas (solo administrador, solo lectura)
Consulta tipo sistema hospitalario de las historias prehospitalarias que llenan los paramédicos. **Cada búsqueda y cada consulta quedan auditadas**. La única acción que modifica algo es **anular** una historia, con motivo: no se borra.
- **Bandeja**: busca por fechas (de atención, evento o cierre; máximo 366 días), ingreso, número, documento, nombre, NN, estado, triage, desenlace, tipo de evento, tipo de servicio, ambulancia, destino, profesional, EPS, régimen, firma y riesgo de caída. Abre con los últimos 7 días.
- **Exportar a Excel**: con los filtros activos, máximo 5000 filas. Es la operación más sensible (lleva datos de pacientes) y pide confirmación.
- **Expediente** de una historia:
  - cabecera del paciente siempre visible, con alertas: alergias, triage rojo o negro, riesgo de caída alto y rechazo del traslado;
  - pestañas: resumen, paciente, valoración XABCDE y AMPLE, signos vitales (tabla y gráfica, con valores fuera de rango resaltados), lesiones, intervenciones, riesgo de caídas (escala Downton), entrega, firmas, servicio y trazabilidad (quién hizo qué y cuándo);
  - se puede descargar en **PDF**.
- **Estados de una historia**: en curso (borrador), cerrada (firmada) y anulada. Una en curso muestra lo que le falta para cerrarse.
- **Paciente NN**: sin identificar. Los documentos AS y MS son "adulto o menor sin identificación".
- **Ingreso**: el servicio completo de una emergencia:
  - solicitud y pacientes;
  - por cada ambulancia: tripulación, tiempos (despacho, alistamiento, **respuesta**, en escena, traslado, total), línea de tiempo, mapa del recorrido, destino e insumos usados.
- **Pacientes**: índice que une las atenciones de una misma persona por su documento. Los NN no aparecen hasta que se identifican. La ficha muestra alergias, medicamentos y antecedentes (con la historia de donde salió cada dato), el último riesgo de caída y todas sus atenciones.
- **Indicadores**: por rango (30 días por defecto):
  - totales: historias, % firmadas, rechazos del traslado, pacientes NN y riesgo de caída;
  - tiempos de respuesta, en escena y traslado, con mediana y P90;
  - distribución por día, triage, tipo de servicio, desenlace, tipo de evento e institución de destino.

### 4.10 Firmas
- **Firma del profesional**: cada paramédico registra la suya en la app, con su contraseña. Al cerrar una historia, el backend estampa esa versión, con un **código de verificación** derivado de la huella del cierre.
  - El administrador consulta el historial de firmas de cada paramédico (vigente, reemplazadas, desactivadas) y puede **desactivar** la vigente con un motivo; el profesional debe registrar otra para volver a cerrar historias.
  - **Nadie puede subir ni cambiar la firma de otro.**
- **Firmas de la historia**, según el tipo de servicio:
  - **comprobante de atención** (paciente o familiar);
  - **disentimiento** cuando el paciente rechaza el traslado (paciente o familiar, y un testigo si el paciente se negó);
  - **entrega** (quien recibe en la institución).
  - Si alguien no pudo firmar, queda el motivo: inconsciente sin familiar, fallecido, se negó u otro.
  - En un traslado programado, el comprobante y la firma de quien recibe son obligatorios.

### 4.11 Usuarios (solo administrador)
Gestión del **personal**: crear cuentas (administrador, despachador, paramédico, conductor), editar datos, cambiar rol, activar, inactivar o bloquear (con motivo; se cierran sus sesiones) y **restablecer la contraseña** de otra persona (también cierra sus sesiones).
- El administrador no puede cambiar su propio estado, quitarse su rol ni restablecer su contraseña desde aquí: la cambia en su perfil, con la actual.
- La política de contraseñas del sistema es de 10 a 128 caracteres, con al menos una letra y un número.

### 4.12 Verificación de ciudadanos (solo administrador)
Fila de ciudadanos que enviaron las fotos de su documento, de los que más llevan esperando a los más nuevos. El administrador ve los datos (incluido el documento completo), compara las dos fotos y decide:
- **Aprobar**: ya puede reportar emergencias.
- **Pedir corrección**: el ciudadano ve el motivo, reenvía y vuelve a la fila.
- **Rechazar**: decisión final.

Cada consulta de las fotos queda auditada. Es una revisión documental interna, no una certificación de identidad.

### 4.13 Mi perfil
Datos de la cuenta propia y cambio de contraseña (exige la actual y cierra todas las sesiones).

---

## 5. Tiempo real

- La central (administrador y despachador) recibe los cambios de emergencias, despachos, avances, ambulancias, turnos, ubicaciones GPS y rutas sin recargar.
- La tripulación recibe solo lo de su propio servicio, en la app.
- Si se cierra la sesión, se cambia la contraseña o el rol, o se bloquea al usuario, la conexión se corta.
- Lo que pasó mientras se estaba desconectado no se reenvía: al reconectar se vuelve a consultar la API.
- Inventario no tiene tiempo real: el resumen se refresca cada minuto.

---

## 6. Reglas que atraviesan todo el sistema

- **El backend es la autoridad**: valida, autoriza y cambia estados. La web refleja la respuesta confirmada y maneja los conflictos (`409`: otro cambió el dato al mismo tiempo; se recarga).
- **Nada importante se borra**: se cancela, se anula, se inactiva o se desactiva, y queda en la auditoría con quién, cuándo y por qué.
- **Hora de Colombia** (`America/Bogota`) en todas las fechas que se muestran y en los rangos de días.
- **Privacidad de pacientes y ciudadanos**:
  - documentos, nombres y fotos nunca van en la URL, el almacenamiento del navegador, los registros de consola ni la analítica;
  - las imágenes (documentos, firmas) y los archivos (PDF, Excel) se descargan con el token y se liberan al salir;
  - los datos de un expediente se liberan de la memoria al cerrarlo.
- **Mapas y direcciones**: la geocodificación y las rutas las calcula el backend; la web nunca llama directamente a Geoapify, Google u OSRM ni guarda llaves en el navegador.
- **Sin datos inventados**: no se simulan GPS, rutas, tiempo real ni valores clínicos que el backend no entregue.

---

## 7. Pendientes conocidos con el backend

- **Separar personal y ciudadanos**: hoy la lista de usuarios mezcla al personal con los ciudadanos. Se pidió al backend un listado propio de ciudadanos (con su estado de cuenta y de verificación) y que "Usuarios" devuelva solo personal. Mientras tanto, la web filtra el rol ciudadano en los formularios.
- **Nombre de los archivos descargados**: el backend debe exponer la cabecera `Content-Disposition` por CORS para que el navegador use el nombre que propone. Mientras tanto la web arma el nombre (`HC-….pdf`, `historias-clinicas-AAAA-MM-DD.csv`).
