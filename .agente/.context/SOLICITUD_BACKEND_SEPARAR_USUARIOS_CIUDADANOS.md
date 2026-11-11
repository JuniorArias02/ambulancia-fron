# Solicitud al backend: separar el personal de los ciudadanos

**Para:** el agente del backend (`ambulancia/back/api`).
**De:** el frontend web (`ambulancia/front`).
**Estado:** propuesta. Falta que el backend la revise, decida los detalles marcados como "a decidir" e implemente.

---

## 1. El problema

Hoy `GET /usuarios` devuelve **el personal y los ciudadanos mezclados**, y `rol` acepta `ciudadano` (`ConsultarUsuariosDto` valida contra `NOMBRES_ROLES`).

En la web, "Usuarios" es la **gestión del personal** (administrador, despachador, paramédico, conductor): crear cuentas, cambiar rol, activar o bloquear. El ciudadano es otro tipo de cuenta:

- se registra solo desde la app;
- no se le puede crear ni cambiar el rol desde la web (el backend ya responde `400` / `422`);
- tiene datos y reglas propias (documento, fecha de nacimiento, verificación de identidad).

Mezclarlos en una sola lista confunde: la tabla de personal se llena de ciudadanos, el filtro "Ciudadano" no le sirve al administrador de personal, y la paginación y los totales dejan de representar al personal.

**Qué hizo ya la web, mientras tanto:** quitó `ciudadano` del filtro de rol y de los formularios de crear y cambiar rol. Pero mientras `GET /usuarios` siga devolviéndolos, los ciudadanos seguirán apareciendo en la tabla de personal cuando no hay filtro de rol.

---

## 2. Lo que se pide: dos endpoints, cada uno con sus filtros

| Lista | Endpoint | Quién | Contenido |
| --- | --- | --- | --- |
| Personal del sistema | `GET /usuarios` (el actual) | `administrador` | **Solo** roles internos |
| Ciudadanos | `GET /ciudadanos` (nuevo, ver §4 sobre la ruta) | `administrador` | **Solo** rol `ciudadano` |

`/verificaciones-ciudadanos` **se queda como está**: es la fila de revisión de identidad (con documento completo y fotos, auditada). La lista de ciudadanos del §4 es para **consultar y gestionar cuentas**, no para revisar documentos.

---

## 3. Cambios en `/usuarios` (solo personal)

### 3.1 `GET /usuarios`

- Filtrar siempre por `ROLES_INTERNOS`: nunca devolver ciudadanos, con o sin filtro.
- `rol`: validar contra `ROLES_INTERNOS` en lugar de `NOMBRES_ROLES`. `rol=ciudadano` → `400`.
- El resto sigue igual: `busqueda` (nombres, apellidos, correo), `estado`, `pagina`, `limite`.

### 3.2 Endpoints por id de `/usuarios`

`GET /usuarios/{id}`, `PATCH /usuarios/{id}`, `PATCH /usuarios/{id}/estado`, `PUT /usuarios/{id}/rol`.

**A decidir** (proponemos la opción A):

- **A.** Si el id es de un ciudadano → `404`, como si no existiera en este recurso. Su gestión pasa a `/ciudadanos` (§4).
- **B.** Mantenerlos tal cual para no romper nada. En ese caso, la web los seguirá usando solo para el personal.

### 3.3 `GET /roles`

La web lo usa para llenar los selects de crear usuario y cambiar rol. Proponemos que devuelva **solo los roles internos** (o que agregue un campo `asignable: boolean`). La web ya filtra `ciudadano` de su lado, así que esto no es urgente.

---

## 4. Nuevo: lista de ciudadanos para el administrador

### 4.1 Ruta

Ya existe `CiudadanosController` en `ciudadanos` con las rutas de la app (`POST acceso`, `POST registro`, `GET/PATCH perfil`, `PUT verificacion`), todas para el rol `ciudadano`.

**A decidir:**

- `GET /ciudadanos` y `GET /ciudadanos/{usuarioId}` con `@RequiereRoles(Roles.ADMINISTRADOR)`. Ojo con el choque `GET /ciudadanos/perfil` vs `GET /ciudadanos/{usuarioId}`: usar `ParseUUIDPipe` y declarar `perfil` antes.
- O bien un controlador aparte, por ejemplo `/administracion/ciudadanos`, para no mezclar rutas de la app con rutas de la web.

En el resto del documento usamos `/ciudadanos` para abreviar.

### 4.2 `GET /ciudadanos`: filtros

| Parámetro | Tipo | Detalle |
| --- | --- | --- |
| `busqueda` | Texto, opcional (máx. 100) | Nombres, apellidos, correo, teléfono **y número de documento** (sin puntos ni espacios) |
| `estadoCuenta` | Opcional | `activo`, `inactivo` o `bloqueado` |
| `estadoVerificacion` | Opcional | `pendiente`, `en_revision`, `requiere_correccion`, `verificado` o `rechazado` |
| `pagina`, `limite` | Enteros | Por defecto 1 y 20; `limite` máx. 100 |

Orden sugerido: `registradoEn` descendente (los más nuevos primero).

### 4.3 Respuesta sugerida

```json
{
  "datos": [
    {
      "id": "6306702a-fa50-48e1-9370-9dd248140697",
      "nombres": "Carlos",
      "apellidos": "Pérez Díaz",
      "correo": "carlos.ciudadano@prueba.co",
      "telefono": "+57 310 555 1234",
      "estadoCuenta": "activo",
      "estadoVerificacion": "verificado",
      "emergenciasReportadas": 3,
      "ultimoAcceso": "2026-11-03T15:20:00.000Z",
      "registradoEn": "2026-11-03T03:14:38.749Z"
    }
  ],
  "total": 1,
  "pagina": 1,
  "limite": 20
}
```

- **Sin `numeroDocumento` ni fotos en esta lista.** El documento completo solo debe verse en `/verificaciones-ciudadanos`, que audita cada consulta. Buscar por número de documento sí debe funcionar.
- `emergenciasReportadas` es opcional, pero sirve para detectar cuentas abusivas. Si es costoso, puede omitirse.

### 4.4 `GET /ciudadanos/{usuarioId}` (opcional)

Los mismos campos de la lista. `404` si el id no es de un ciudadano. Si no se implementa, la web usa solo la lista.

### 4.5 `PATCH /ciudadanos/{usuarioId}/estado`

Bloquear o reactivar una cuenta de ciudadano (hoy se hace con `PATCH /usuarios/{id}/estado`).

```json
{ "estado": "bloqueado", "motivo": "Reportes falsos reiterados" }
```

- Las mismas reglas del endpoint actual: `motivo` obligatorio, se cierran las sesiones al bloquear, queda en la auditoría.
- Responde el ciudadano actualizado, con la forma del §4.3.
- `404` si no es un ciudadano.

---

## 5. Lo que hará la web cuando esté listo

- **Usuarios** (`/usuarios`): solo personal, con sus filtros de rol interno y estado. Desaparece la acción "Ver verificación" de esa tabla.
- **Ciudadanos**: una pantalla aparte, en el menú "Administración", con buscador, filtro de estado de cuenta y de verificación, y las acciones "Ver verificación" (abre `/verificaciones-ciudadanos/{usuarioId}`), "Bloquear" y "Reactivar".
- **Verificación de ciudadanos**: sin cambios.

---

## 6. Pruebas sugeridas

1. `GET /usuarios` sin filtros no incluye ningún ciudadano; `total` cuenta solo personal.
2. `GET /usuarios?rol=ciudadano` → `400`.
3. `GET /ciudadanos` solo devuelve ciudadanos; los filtros `estadoCuenta` y `estadoVerificacion` funcionan, solos y combinados.
4. `GET /ciudadanos?busqueda=88222333` encuentra al ciudadano por documento, pero la respuesta no trae `numeroDocumento`.
5. Despachador, paramédico, conductor y ciudadano reciben `403` en `GET /ciudadanos` y `PATCH /ciudadanos/{id}/estado`.
6. `PATCH /ciudadanos/{id}/estado` con el id de alguien del personal → `404`.
7. Las rutas de la app (`/ciudadanos/perfil`, `registro`, `acceso`, `verificacion`) siguen funcionando igual.

Cuando esté implementado, por favor deja una guía para el frontend en `.agente/.context/` con las respuestas reales, como en las anteriores.
