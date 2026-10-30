import { ArrowUpRight, MapPin, MapPinOff, Navigation, Route, Send, SignalZero, Timer } from 'lucide-react';
import { generatePath, Link } from 'react-router';
import { RUTAS } from '../../../constants/rutas';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { haceTiempo } from '../../../utils/tiempo_transcurrido';
import { InsigniaEstadoOperativo } from '../../ambulances/components/insignia_estado_operativo';
import { PlacaAmbulancia } from '../../ambulances/components/placa_ambulancia';
import type { Ambulancia } from '../../ambulances/types/ambulancia.types';
import { senalUbicacion, textoSenal } from '../../ambulances/utils/senal_ubicacion';
import { ETIQUETAS_ESTADO_ASIGNACION } from '../../assignments/constants/asignaciones';
import type { Ruta } from '../../assignments/schemas/ruta.schema';
import type { Asignacion } from '../../assignments/types/asignacion.types';
import { resumenRuta, tieneRuta } from '../../assignments/utils/formato_ruta';
import { InsigniaEstadoEmergencia, InsigniaPrioridad } from '../../emergencies/components/insignias_emergencia';
import { esActiva } from '../../emergencies/constants/catalogos_emergencia';
import type { Emergencia } from '../../emergencies/types/emergencia.types';

const claseEnlace =
  'campo-vidrio inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-[13px] font-medium text-texto transition-colors duration-150 hover:bg-white';

interface PropiedadesFichaEmergencia {
  emergencia: Emergencia;
  ahora: number;
  alDespachar: () => void;
}

export function FichaEmergencia({ emergencia, ahora, alDespachar }: PropiedadesFichaEmergencia) {
  const puedeDespachar = esActiva(emergencia.estado) && !emergencia.emergenciaPrincipalId;
  return (
    <div className="space-y-3 px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base font-semibold text-texto tabular-nums">{emergencia.numeroEmergencia}</span>
        <InsigniaPrioridad prioridad={emergencia.prioridad} />
        <InsigniaEstadoEmergencia estado={emergencia.estado} />
      </div>
      <p className="line-clamp-3 text-sm text-texto">{emergencia.descripcion}</p>
      <div className="space-y-1 text-[13px] text-texto-secundario">
        {emergencia.direccion && (
          <p className="flex items-start gap-1.5">
            <MapPin aria-hidden strokeWidth={1.75} className="mt-0.5 size-3.5 shrink-0" />
            {emergencia.direccion}
          </p>
        )}
        <p className="flex items-center gap-1.5" title={formatearFechaHora(emergencia.recibidaEn)}>
          <Timer aria-hidden strokeWidth={1.75} className="size-3.5" />
          Recibida {haceTiempo(emergencia.recibidaEn, ahora)}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {puedeDespachar && (
          <button
            type="button"
            onClick={alDespachar}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primario px-3 text-[13px] font-semibold text-white shadow-primario transition-colors duration-150 hover:bg-primario-hover"
          >
            <Send aria-hidden strokeWidth={1.75} className="size-3.5" />
            {emergencia.estado === 'recibida' ? 'Despachar' : 'Despachar otra'}
          </button>
        )}
        <Link to={generatePath(RUTAS.detalleEmergencia, { id: emergencia.id })} className={claseEnlace}>
          Ver detalle
          <ArrowUpRight aria-hidden strokeWidth={1.75} className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

interface PropiedadesFichaAmbulancia {
  ambulancia: Ambulancia;
  asignacion: Asignacion | undefined;
  ruta: Ruta | undefined;
  ahora: number;
}

export function FichaAmbulancia({ ambulancia, asignacion, ruta, ahora }: PropiedadesFichaAmbulancia) {
  const ubicacion = ambulancia.ultimaUbicacion;
  const senal = senalUbicacion(ubicacion, ahora);
  const IconoSenal = senal === 'ninguna' ? MapPinOff : senal === 'reciente' ? MapPin : SignalZero;
  return (
    <div className="space-y-3 px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base font-semibold text-texto">{ambulancia.codigo}</span>
        <PlacaAmbulancia placa={ambulancia.placa} />
        <InsigniaEstadoOperativo estado={ambulancia.estadoOperativo} />
      </div>
      <p className="text-[13px] text-texto-secundario">
        {ambulancia.tipo.nombre}
        {ambulancia.tipo.descripcion ? ` — ${ambulancia.tipo.descripcion}` : ''}
      </p>
      {asignacion && (
        <Link
          to={generatePath(RUTAS.detalleEmergencia, { id: asignacion.emergenciaId })}
          className="flex items-center gap-2 rounded-xl bg-primario/6 px-3 py-2 text-[13px] text-texto transition-colors duration-150 hover:bg-primario/10"
        >
          <Navigation aria-hidden strokeWidth={1.75} className="size-4 shrink-0 text-primario" />
          <span className="min-w-0 flex-1 truncate">
            Va a <span className="font-semibold tabular-nums">{asignacion.numeroEmergencia ?? 'una emergencia'}</span> ·{' '}
            {ETIQUETAS_ESTADO_ASIGNACION[asignacion.estado]}
          </span>
          <ArrowUpRight aria-hidden strokeWidth={1.75} className="size-3.5 shrink-0" />
        </Link>
      )}
      {asignacion && tieneRuta(asignacion) && (
        <div className="flex items-start gap-2 text-[13px]">
          <Route aria-hidden strokeWidth={1.75} className="mt-0.5 size-3.5 shrink-0 text-primario" />
          {ruta ? (
            <span className="min-w-0">
              <span className="block font-medium text-texto">{resumenRuta(ruta)}</span>
              <span className="block text-texto-secundario">Ruta por calles · estimado sin tráfico</span>
            </span>
          ) : (
            <span className="text-texto-secundario">Calculando ruta: se espera un reporte GPS reciente.</span>
          )}
        </div>
      )}
      <p
        className={`flex items-center gap-1.5 text-[13px] ${
          senal === 'reciente' || senal === 'ninguna' ? 'text-texto-secundario' : 'text-advertencia-hover'
        }`}
        title={ubicacion ? formatearFechaHora(ubicacion.registradaEn) : undefined}
      >
        <IconoSenal aria-hidden strokeWidth={1.75} className="size-3.5" />
        {senal === 'ninguna' ? 'Nunca ha reportado GPS: no aparece en el mapa.' : textoSenal(ubicacion, ahora)}
      </p>
      <Link to={generatePath(RUTAS.detalleAmbulancia, { id: ambulancia.id })} className={claseEnlace}>
        Ver detalle
        <ArrowUpRight aria-hidden strokeWidth={1.75} className="size-3.5" />
      </Link>
    </div>
  );
}
