import { Inbox, MapPin, MapPinOff, Navigation, SignalZero } from 'lucide-react';
import { InsigniaEstadoOperativo } from '../../ambulances/components/insignia_estado_operativo';
import type { Ambulancia } from '../../ambulances/types/ambulancia.types';
import { senalUbicacion, textoSenal } from '../../ambulances/utils/senal_ubicacion';
import { ETIQUETAS_ESTADO_ASIGNACION } from '../../assignments/constants/asignaciones';
import type { Ruta } from '../../assignments/schemas/ruta.schema';
import type { Asignacion } from '../../assignments/types/asignacion.types';
import { textoDuracion } from '../../assignments/utils/formato_ruta';

interface PropiedadesListaFlota {
  ambulancias: Ambulancia[];
  asignaciones: Map<string, Asignacion>;
  rutas: Map<string, Ruta>;
  seleccionadaId?: string;
  ahora: number;
  alElegir: (ambulancia: Ambulancia) => void;
}

/** Todas las ambulancias del filtro, también las que nunca reportaron GPS y no salen en el mapa. */
export function ListaFlota({ ambulancias, asignaciones, rutas, seleccionadaId, ahora, alElegir }: PropiedadesListaFlota) {
  if (ambulancias.length === 0) {
    return (
      <p className="flex items-center gap-2.5 px-4 py-4 text-sm text-texto-secundario">
        <Inbox aria-hidden strokeWidth={1.75} className="size-4 shrink-0" />
        Ninguna ambulancia coincide con el filtro.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-borde/60">
      {ambulancias.map((ambulancia) => {
        const asignacion = asignaciones.get(ambulancia.id);
        const ruta = rutas.get(ambulancia.id);
        const senal = senalUbicacion(ambulancia.ultimaUbicacion, ahora);
        const IconoSenal = senal === 'ninguna' ? MapPinOff : senal === 'reciente' ? MapPin : SignalZero;
        const seleccionada = ambulancia.id === seleccionadaId;
        return (
          <li key={ambulancia.id} className="px-2 py-1.5">
            <button
              type="button"
              onClick={() => alElegir(ambulancia)}
              aria-current={seleccionada ? 'true' : undefined}
              className={`w-full rounded-xl px-2 py-2 text-left transition-colors duration-150 hover:bg-white focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none ${
                seleccionada ? 'bg-white shadow-vidrio ring-1 ring-primario/25' : ''
              }`}
            >
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-texto">{ambulancia.codigo}</span>
                <InsigniaEstadoOperativo estado={ambulancia.estadoOperativo} />
              </span>
              {asignacion && (
                <span className="mt-1 flex items-center gap-1.5 truncate text-[13px] text-texto">
                  <Navigation aria-hidden strokeWidth={1.75} className="size-3.5 shrink-0 text-primario" />
                  <span className="truncate">
                    {asignacion.numeroEmergencia ?? 'Emergencia'} · {ETIQUETAS_ESTADO_ASIGNACION[asignacion.estado]}
                    {ruta && ` · ${textoDuracion(ruta.duracionSegundos)}`}
                  </span>
                </span>
              )}
              <span
                className={`mt-1 flex items-center gap-1.5 text-[13px] ${
                  senal === 'reciente' ? 'text-texto-secundario' : senal === 'ninguna' ? 'text-texto-secundario' : 'text-advertencia-hover'
                }`}
              >
                <IconoSenal aria-hidden strokeWidth={1.75} className="size-3.5 shrink-0" />
                {textoSenal(ambulancia.ultimaUbicacion, ahora)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
