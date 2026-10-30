import { Ambulance, ArrowUpRight, BedSingle, Copy, MapPinCheck, Landmark, MapPin, Send, Siren, Tag, Timer, UsersRound, X, type LucideIcon } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { Popup } from 'react-leaflet';
import { generatePath, Link } from 'react-router';
import { RUTAS } from '../../../constants/rutas';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { haceTiempo } from '../../../utils/tiempo_transcurrido';
import type { Ruta } from '../../assignments/schemas/ruta.schema';
import { resumenRuta } from '../../assignments/utils/formato_ruta';
import { InsigniaEstadoEmergencia, InsigniaPrioridad } from '../../emergencies/components/insignias_emergencia';
import { esActiva, ETIQUETAS_TIPO_INCIDENTE } from '../../emergencies/constants/catalogos_emergencia';
import { ESTILO_SIN_PRIORIDAD, ESTILOS_PRIORIDAD } from '../../emergencies/constants/estilos_emergencia';
import type { Coordenadas, Emergencia } from '../../emergencies/types/emergencia.types';
import type { EtapaEmergencia } from '../utils/flota';

interface PropiedadesPopupEmergencia {
  emergencia: Emergencia;
  posicion: Coordenadas;
  ahora: number;
  /** Rutas de las ambulancias que van hacia esta emergencia. */
  rutas: Ruta[];
  etapa: EtapaEmergencia;
  alCerrar: () => void;
  alDespachar: () => void;
}

const AVISO_ETAPA: Partial<Record<EtapaEmergencia, { icono: LucideIcon; texto: string; clases: string }>> = {
  en_lugar: { icono: MapPinCheck, texto: 'Ambulancia en el lugar', clases: 'bg-primario/8 text-primario' },
  paciente_recogido: {
    icono: BedSingle,
    texto: 'Paciente a bordo · ya no hay nadie en el sitio',
    clases: 'bg-cian/12 text-cian-texto',
  },
};

const DESPLAZAMIENTO_SOBRE_MARCADOR: [number, number] = [0, -18];

/** Margen para que el panel no quede bajo la barra superior ni bajo el panel operativo. */
function margenesAutoPan(): { arribaIzquierda: [number, number]; abajoDerecha: [number, number] } {
  const escritorio = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
  return escritorio
    ? { arribaIzquierda: [24, 104], abajoDerecha: [372, 72] }
    : { arribaIzquierda: [12, 96], abajoDerecha: [12, 16] };
}

function Dato({ icono: Icono, etiqueta, children }: { icono: LucideIcon; etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <Icono aria-hidden strokeWidth={1.75} className="mt-0.5 size-3.5 shrink-0 text-texto-secundario" />
      <dt className="sr-only">{etiqueta}</dt>
      <dd className="min-w-0 text-texto">{children}</dd>
    </div>
  );
}

/**
 * Panel flotante anclado al marcador. Los estilos por defecto de Leaflet sobre `a` y `p`
 * tienen más especificidad que las utilidades: por eso se usan `div` y colores con `!`.
 */
export function PopupEmergencia({ emergencia, posicion, ahora, rutas, etapa, alCerrar, alDespachar }: PropiedadesPopupEmergencia) {
  const aviso = AVISO_ETAPA[etapa];
  const idTitulo = useId();
  const { clases } = emergencia.prioridad ? ESTILOS_PRIORIDAD[emergencia.prioridad] : ESTILO_SIN_PRIORIDAD;
  const puedeDespachar = esActiva(emergencia.estado) && !emergencia.emergenciaPrincipalId;
  const { arribaIzquierda, abajoDerecha } = margenesAutoPan();

  return (
    <Popup
      position={[posicion.latitud, posicion.longitud]}
      className="popup-vidrio"
      closeButton={false}
      minWidth={288}
      maxWidth={320}
      offset={DESPLAZAMIENTO_SOBRE_MARCADOR}
      autoPanPaddingTopLeft={arribaIzquierda}
      autoPanPaddingBottomRight={abajoDerecha}
      // Se cierra con su botón, con Escape o al hacer clic en el mapa.
      eventHandlers={{ remove: alCerrar }}
    >
      <section aria-labelledby={idTitulo} className="flex flex-col">
        <header className="flex items-start gap-3 px-4 pt-4">
          <span aria-hidden className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${clases}`}>
            <Siren strokeWidth={1.75} className="size-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 id={idTitulo} className="text-[15px] leading-tight font-semibold text-texto tabular-nums">
              {emergencia.numeroEmergencia}
            </h3>
            <div
              className="mt-1 flex items-center gap-1.5 text-[13px] text-texto-secundario"
              title={formatearFechaHora(emergencia.recibidaEn)}
            >
              <Timer aria-hidden strokeWidth={1.75} className="size-3.5" />
              Recibida {haceTiempo(emergencia.recibidaEn, ahora)}
            </div>
          </div>
          <button
            type="button"
            onClick={alCerrar}
            aria-label="Cerrar"
            title="Cerrar"
            className="-mt-1 -mr-2 flex size-8 shrink-0 items-center justify-center rounded-lg text-texto-secundario transition-colors duration-150 hover:bg-white hover:text-texto focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none"
          >
            <X aria-hidden strokeWidth={1.75} className="size-4" />
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-1.5 px-4 pt-3">
          <InsigniaPrioridad prioridad={emergencia.prioridad} detallada />
          <InsigniaEstadoEmergencia estado={emergencia.estado} />
        </div>

        {aviso && (
          <div className={`mx-4 mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium ${aviso.clases}`}>
            <aviso.icono aria-hidden strokeWidth={1.75} className="size-4 shrink-0" />
            {aviso.texto}
          </div>
        )}

        <div className="line-clamp-3 px-4 pt-3 text-sm text-texto">{emergencia.descripcion}</div>

        <dl className="flex flex-col gap-1.5 px-4 pt-3 pb-4 text-[13px]">
          {emergencia.direccion && (
            <Dato icono={MapPin} etiqueta="Dirección">
              {emergencia.direccion}
            </Dato>
          )}
          {emergencia.referenciaLugar && (
            <Dato icono={Landmark} etiqueta="Referencia">
              {emergencia.referenciaLugar}
            </Dato>
          )}
          {emergencia.tipoIncidente && (
            <Dato icono={Tag} etiqueta="Tipo de incidente">
              {ETIQUETAS_TIPO_INCIDENTE[emergencia.tipoIncidente]}
            </Dato>
          )}
          {emergencia.numeroVictimas !== null && (
            <Dato icono={UsersRound} etiqueta="Víctimas">
              {emergencia.numeroVictimas} {emergencia.numeroVictimas === 1 ? 'víctima' : 'víctimas'}
            </Dato>
          )}
          {emergencia.emergenciaPrincipalId && (
            <Dato icono={Copy} etiqueta="Duplicada">
              Llamada repetida de otra emergencia
            </Dato>
          )}
        </dl>

        {rutas.length > 0 && (
          <div className="mx-4 mb-4 flex flex-col gap-1.5 rounded-xl bg-primario/6 px-3 py-2.5">
            <div className="text-xs font-medium text-texto-secundario">Ambulancias en camino · estimado sin tráfico</div>
            {rutas.map((ruta) => (
              <div key={ruta.asignacionId} className="flex items-center gap-2 text-[13px] text-texto">
                <Ambulance aria-hidden strokeWidth={1.75} className="size-3.5 shrink-0 text-primario" />
                <span className="font-semibold">{ruta.ambulanciaCodigo ?? 'Ambulancia'}</span>
                <span className="min-w-0 truncate">{resumenRuta(ruta)}</span>
              </div>
            ))}
          </div>
        )}

        <footer className="flex gap-2 border-t border-borde/70 bg-white/40 px-3 py-3">
          {puedeDespachar && (
            <button
              type="button"
              onClick={alDespachar}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primario px-3 text-[13px] font-semibold text-white shadow-primario transition-colors duration-150 hover:bg-primario-hover focus-visible:ring-4 focus-visible:ring-primario/25 focus-visible:outline-none"
            >
              <Send aria-hidden strokeWidth={1.75} className="size-3.5" />
              {emergencia.estado === 'recibida' ? 'Despachar' : 'Despachar otra'}
            </button>
          )}
          <Link
            to={generatePath(RUTAS.detalleEmergencia, { id: emergencia.id })}
            className={`campo-vidrio inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-3 text-[13px] font-medium text-texto! transition-colors duration-150 hover:bg-white focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none ${
              puedeDespachar ? '' : 'flex-1'
            }`}
          >
            Ver detalle
            <ArrowUpRight aria-hidden strokeWidth={1.75} className="size-3.5" />
          </Link>
        </footer>
      </section>
    </Popup>
  );
}
