import { Ambulance, Ban, CircleCheck, Hospital, MapPinOff, Package, UserRound } from 'lucide-react';
import { lazy, Suspense } from 'react';
import type { PuntoMapa } from '../../map/utils/coordenadas';
import {
  ETIQUETAS_ESTADO_ASIGNACION,
  ETIQUETAS_ESTADO_MOVIMIENTO,
  ETIQUETAS_FUNCION,
  ETIQUETAS_TIPO_AMBULANCIA,
  ETIQUETAS_TIPO_MOVIMIENTO,
} from '../constants/catalogos_clinicos';
import type { AsignacionIngreso, MovimientoInsumos, TiemposServicio } from '../types/historia_clinica.types';
import { formatearDuracion, formatearFechaHora, formatearHora } from '../utils/formato_clinico';
import { LineaTiempo, type ElementoLinea } from './linea_tiempo';
import { Bloque } from './valor_o_dato';

// Leaflet pesa: el mapa se carga aparte, solo cuando se ve un ingreso.
const MapaRecorrido = lazy(() => import('./mapa_recorrido').then((modulo) => ({ default: modulo.MapaRecorrido })));

const TARJETAS_TIEMPO: readonly { clave: keyof TiemposServicio; titulo: string; detalle: string; destacada?: boolean }[] = [
  { clave: 'despachoSegundos', titulo: 'Despacho', detalle: 'Recepción → asignación' },
  { clave: 'alistamientoSegundos', titulo: 'Alistamiento', detalle: 'Asignación → salida' },
  { clave: 'respuestaSegundos', titulo: 'Respuesta', detalle: 'Asignación → llegada a la escena', destacada: true },
  { clave: 'enEscenaSegundos', titulo: 'En escena', detalle: 'Llegada → salida de la escena' },
  { clave: 'trasladoSegundos', titulo: 'Traslado', detalle: 'Escena → destino' },
  { clave: 'totalSegundos', titulo: 'Total', detalle: 'Asignación → finalización' },
];

function TarjetaTiempo({ titulo, detalle, segundos, destacada = false }: { titulo: string; detalle: string; segundos: number | null; destacada?: boolean }) {
  return (
    <div className={`rounded-2xl px-4 py-3 ${destacada ? 'bg-primario/8 ring-1 ring-primario/25' : 'border border-borde/70 bg-white/70'}`}>
      <p className={`text-[13px] font-medium ${destacada ? 'text-primario' : 'text-texto-secundario'}`}>{titulo}</p>
      <p className={`mt-1 font-semibold tracking-tight text-texto tabular-nums ${destacada ? 'text-3xl' : 'text-2xl'}`}>
        {formatearDuracion(segundos)}
      </p>
      <p className="mt-0.5 text-xs text-texto-secundario">{detalle}</p>
    </div>
  );
}

function elementosEventos(asignacion: AsignacionIngreso): ElementoLinea[] {
  return asignacion.eventos.map((evento) => {
    const cancelada = evento.estadoNuevo === 'cancelada';
    const finalizada = evento.estadoNuevo === 'finalizada';
    const quien = [evento.usuario?.nombreCompleto, evento.rolResponsable ? ETIQUETAS_FUNCION[evento.rolResponsable] ?? evento.rolResponsable : null]
      .filter(Boolean)
      .join(' · ');
    return {
      id: `${evento.estadoNuevo}-${evento.ocurridoEn}`,
      instante: evento.ocurridoEn,
      hora: formatearHora(evento.ocurridoEn, true),
      titulo: ETIQUETAS_ESTADO_ASIGNACION[evento.estadoNuevo] ?? evento.estadoNuevo,
      subtitulo: quien || undefined,
      tono: cancelada ? 'critico' : finalizada ? 'exito' : 'primario',
      icono: cancelada ? Ban : finalizada ? CircleCheck : undefined,
      contenido:
        evento.fueraDeRadio || evento.observacion ? (
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            {evento.fueraDeRadio && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-advertencia/12 px-2.5 py-0.5 font-medium text-advertencia">
                <MapPinOff aria-hidden strokeWidth={2} className="size-3.5" />
                Marcado a {evento.distanciaEscenaMetros?.toLocaleString('es-CO') ?? '—'} m de la escena
              </span>
            )}
            {evento.observacion && <span className="text-texto">{evento.observacion}</span>}
          </div>
        ) : undefined,
    };
  });
}

function TablaInsumos({ movimiento }: { movimiento: MovimientoInsumos }) {
  const anulado = movimiento.estado === 'anulado';
  return (
    <div className={`overflow-x-auto rounded-xl border border-borde/70 bg-white/70 ${anulado ? 'opacity-60' : ''}`}>
      <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-borde/70 px-4 py-2.5 text-[13px] ${anulado ? 'line-through' : ''}`}>
        <span className="font-medium text-texto">{movimiento.codigo}</span>
        <span className="text-texto-secundario">
          {ETIQUETAS_TIPO_MOVIMIENTO[movimiento.tipo] ?? movimiento.tipo} · {ETIQUETAS_ESTADO_MOVIMIENTO[movimiento.estado] ?? movimiento.estado}
        </span>
        <span className="text-texto-secundario">
          {formatearFechaHora(movimiento.realizadoEn)} · {movimiento.registradoPor.nombreCompleto ?? 'Sin dato'}
        </span>
      </div>
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="text-xs tracking-wide text-texto-secundario uppercase">
            <th scope="col" className="px-4 py-2 font-medium">Insumo</th>
            <th scope="col" className="px-4 py-2 font-medium">Cantidad</th>
            <th scope="col" className="px-4 py-2 font-medium">Lote o serie</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-borde/60">
          {movimiento.items.map((item) => (
            <tr key={`${item.insumoId}-${item.numeroLote ?? ''}-${item.numeroSerie ?? ''}`}>
              <td className="px-4 py-2 text-texto">
                {item.nombre} <span className="text-xs text-texto-secundario">{item.codigo}</span>
              </td>
              <td className="px-4 py-2 text-texto tabular-nums">
                {item.cantidad} {item.unidadMedida}
              </td>
              <td className="px-4 py-2 text-texto-secundario">{item.numeroLote ?? item.numeroSerie ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface PropiedadesSeccionAsignacion {
  asignacion: AsignacionIngreso;
  escena: PuntoMapa | null;
  destino: PuntoMapa | null;
}

export function SeccionAsignacion({ asignacion, escena, destino }: PropiedadesSeccionAsignacion) {
  const { ambulancia } = asignacion;
  return (
    <section aria-label={`Ambulancia ${ambulancia.codigo}`} className="vidrio space-y-8 rounded-2xl px-5 py-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2.5 text-lg font-semibold text-texto">
          <Ambulance aria-hidden strokeWidth={1.75} className="size-5 text-primario" />
          Ambulancia {ambulancia.codigo}
          <span className="text-sm font-normal text-texto-secundario" title={ETIQUETAS_TIPO_AMBULANCIA[ambulancia.tipo]}>
            · {ambulancia.tipo} · {ambulancia.placa}
          </span>
        </h3>
        <span className="text-[13px] text-texto-secundario">
          {ETIQUETAS_ESTADO_ASIGNACION[asignacion.estado] ?? asignacion.estado} · asignada {formatearFechaHora(asignacion.asignadaEn)}
          {asignacion.asignadaPor?.nombreCompleto && ` por ${asignacion.asignadaPor.nombreCompleto}`}
        </span>
      </header>

      {asignacion.motivoCancelacion && (
        <p role="note" className="rounded-xl bg-critico/8 px-4 py-2.5 text-sm text-critico">
          <span className="font-semibold">Cancelada: </span>
          {asignacion.motivoCancelacion}
        </p>
      )}

      <Bloque titulo="Tripulación">
        {asignacion.tripulacion.length === 0 ? (
          <p className="text-sm text-texto-secundario">Sin tripulación registrada.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {asignacion.tripulacion.map((tripulante) => (
              <li key={tripulante.usuarioId} className="inline-flex items-center gap-2 rounded-full bg-white/70 py-1.5 pr-3 pl-2 text-[13px] ring-1 ring-borde/80">
                <UserRound aria-hidden strokeWidth={1.75} className="size-4 text-texto-secundario" />
                <span className="font-medium text-texto">{tripulante.nombreCompleto}</span>
                <span className="text-texto-secundario">{ETIQUETAS_FUNCION[tripulante.funcion] ?? tripulante.funcion}</span>
              </li>
            ))}
          </ul>
        )}
      </Bloque>

      <Bloque titulo="Tiempos">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {TARJETAS_TIEMPO.map((tarjeta) => (
            <TarjetaTiempo key={tarjeta.clave} titulo={tarjeta.titulo} detalle={tarjeta.detalle} segundos={asignacion.tiempos[tarjeta.clave]} destacada={tarjeta.destacada} />
          ))}
        </div>
      </Bloque>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Bloque titulo="Línea de tiempo">
          {asignacion.eventos.length === 0 ? (
            <p className="text-sm text-texto-secundario">Sin cambios de estado registrados.</p>
          ) : (
            <LineaTiempo etiqueta={`Estados de la ambulancia ${ambulancia.codigo}`} elementos={elementosEventos(asignacion)} />
          )}
        </Bloque>
        <div className="space-y-8">
          <Bloque titulo="Recorrido">
            <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-white/50 sm:h-80" />}>
              <MapaRecorrido asignacion={asignacion} escena={escena} destino={destino} />
            </Suspense>
          </Bloque>
          <Bloque titulo="Destino">
            {asignacion.institucionDestino ? (
              <p className="flex items-start gap-2.5 text-sm">
                <Hospital aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-texto-secundario" />
                <span>
                  <span className="font-medium text-texto">{asignacion.institucionDestino.nombre}</span>
                  {asignacion.institucionDestino.direccion && (
                    <span className="block text-[13px] text-texto-secundario">{asignacion.institucionDestino.direccion}</span>
                  )}
                </span>
              </p>
            ) : (
              <p className="text-sm text-texto-secundario">Sin institución de destino.</p>
            )}
          </Bloque>
        </div>
      </div>

      <Bloque titulo="Insumos usados">
        {asignacion.insumos.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-texto-secundario">
            <Package aria-hidden strokeWidth={1.75} className="size-4" />
            No se registraron insumos en este servicio.
          </p>
        ) : (
          <div className="space-y-3">
            {asignacion.insumos.map((movimiento) => (
              <TablaInsumos key={movimiento.id} movimiento={movimiento} />
            ))}
          </div>
        )}
      </Bloque>
    </section>
  );
}
