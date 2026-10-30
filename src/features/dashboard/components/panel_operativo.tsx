import { Ambulance, ArrowLeft, LoaderCircle, MapPinOff, Siren, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { SelectorSegmentado, type OpcionSegmentada } from '../../../components/ui/selector_segmentado';
import { RUTAS } from '../../../constants/rutas';
import type { Ambulancia } from '../../ambulances/types/ambulancia.types';
import type { Ruta } from '../../assignments/schemas/ruta.schema';
import type { Asignacion } from '../../assignments/types/asignacion.types';
import type { Emergencia } from '../../emergencies/types/emergencia.types';
import { pendientesDeDespacho } from '../utils/operacion';
import type { Seleccion } from './capa_operativa';
import { FichaAmbulancia, FichaEmergencia } from './fichas_seleccion';
import { ListaFlota } from './lista_flota';
import { ListaPendientes } from './lista_pendientes';

type VistaPanel = 'pendientes' | 'flota';

interface PropiedadesPanelOperativo {
  emergencias: Emergencia[];
  /** Toda la flota, para encontrar la ambulancia elegida aunque el filtro la oculte. */
  ambulancias: Ambulancia[];
  /** Las que pasan el filtro del mapa. */
  ambulanciasFiltradas: Ambulancia[];
  asignaciones: Map<string, Asignacion>;
  rutas: Map<string, Ruta>;
  seleccion: Seleccion | null;
  ahora: number;
  cargando: boolean;
  actualizando: boolean;
  error: string | null;
  alSeleccionar: (seleccion: Seleccion | null) => void;
  alDespachar: (emergencia: Emergencia) => void;
}

/** Panel contextual sobre el mapa: lo pendiente, la flota o el detalle de lo elegido, sin tapar el mapa. */
export function PanelOperativo({
  emergencias,
  ambulancias,
  ambulanciasFiltradas,
  asignaciones,
  rutas,
  seleccion,
  ahora,
  cargando,
  actualizando,
  error,
  alSeleccionar,
  alDespachar,
}: PropiedadesPanelOperativo) {
  const [vista, setVista] = useState<VistaPanel>('pendientes');
  const pendientes = pendientesDeDespacho(emergencias);
  const sinCoordenadas = emergencias.filter(({ coordenadas }) => !coordenadas).length;
  const emergenciaElegida = seleccion?.tipo === 'emergencia' ? emergencias.find(({ id }) => id === seleccion.id) : undefined;
  const ambulanciaElegida = seleccion?.tipo === 'ambulancia' ? ambulancias.find(({ id }) => id === seleccion.id) : undefined;
  // La emergencia con coordenadas se muestra en su panel flotante sobre el mapa; aquí solo la que no tiene.
  const emergenciaSinPunto = emergenciaElegida && !emergenciaElegida.coordenadas ? emergenciaElegida : undefined;
  const hayFicha = Boolean(emergenciaSinPunto ?? ambulanciaElegida);

  const vistas: OpcionSegmentada<VistaPanel>[] = [
    { valor: 'pendientes', texto: `Pendientes · ${pendientes.length}`, icono: Siren },
    { valor: 'flota', texto: `Flota · ${ambulanciasFiltradas.length}`, icono: Ambulance },
  ];

  return (
    <aside aria-label="Panel operativo" className="vidrio-fuerte flex max-h-full flex-col overflow-hidden rounded-2xl">
      <header className="flex shrink-0 items-center gap-2 border-b border-borde/70 px-3 py-2.5">
        {hayFicha ? (
          <button
            type="button"
            onClick={() => alSeleccionar(null)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[13px] font-medium text-texto-secundario hover:bg-white hover:text-texto"
          >
            <ArrowLeft aria-hidden strokeWidth={1.75} className="size-4" />
            {vista === 'flota' ? 'Flota' : 'Pendientes'}
          </button>
        ) : (
          <SelectorSegmentado etiqueta="Contenido del panel" valor={vista} opciones={vistas} alCambiar={setVista} />
        )}
        <span className="ml-auto flex items-center gap-2">
          {actualizando && <LoaderCircle aria-label="Actualizando" className="size-3.5 animate-spin text-texto-secundario" />}
          {hayFicha && (
            <button
              type="button"
              onClick={() => alSeleccionar(null)}
              aria-label="Cerrar"
              title="Cerrar"
              className="flex size-8 items-center justify-center rounded-lg text-texto-secundario hover:bg-white hover:text-texto"
            >
              <X aria-hidden strokeWidth={1.75} className="size-4" />
            </button>
          )}
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {error ? (
          <p role="alert" className="px-4 py-4 text-[13px] text-critico">
            {error}
          </p>
        ) : cargando ? (
          <p role="status" className="flex items-center gap-2 px-4 py-4 text-sm text-texto-secundario">
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
            Cargando la operación…
          </p>
        ) : emergenciaSinPunto ? (
          <FichaEmergencia emergencia={emergenciaSinPunto} ahora={ahora} alDespachar={() => alDespachar(emergenciaSinPunto)} />
        ) : ambulanciaElegida ? (
          <FichaAmbulancia
            ambulancia={ambulanciaElegida}
            asignacion={asignaciones.get(ambulanciaElegida.id)}
            ruta={rutas.get(ambulanciaElegida.id)}
            ahora={ahora}
          />
        ) : vista === 'flota' ? (
          <ListaFlota
            ambulancias={ambulanciasFiltradas}
            asignaciones={asignaciones}
            rutas={rutas}
            ahora={ahora}
            alElegir={(ambulancia) => alSeleccionar({ tipo: 'ambulancia', id: ambulancia.id })}
          />
        ) : (
          <ListaPendientes
            pendientes={pendientes}
            seleccionadaId={emergenciaElegida?.id}
            ahora={ahora}
            alElegir={(emergencia) => alSeleccionar({ tipo: 'emergencia', id: emergencia.id })}
            alDespachar={alDespachar}
          />
        )}
      </div>

      {!hayFicha && !cargando && vista === 'pendientes' && sinCoordenadas > 0 && (
        <footer className="shrink-0 border-t border-borde/70 px-4 py-2.5 text-[13px] text-texto-secundario">
          <Link to={RUTAS.emergencias} className="inline-flex items-center gap-1.5 hover:text-primario">
            <MapPinOff aria-hidden strokeWidth={1.75} className="size-3.5" />
            {sinCoordenadas} {sinCoordenadas === 1 ? 'emergencia activa no aparece' : 'emergencias activas no aparecen'} en
            el mapa por falta de coordenadas
          </Link>
        </footer>
      )}
    </aside>
  );
}
