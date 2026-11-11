import { X } from 'lucide-react';
import { claseControlFiltro, SelectorFiltro } from '../../../components/forms/selector_filtro';
import { ESTADOS_CHEQUEO, ETIQUETAS_ESTADO_CHEQUEO, LIMITE_CONDUCTORES } from '../constants/chequeos_diarios';
import { useFlota } from '../../ambulances/hooks/use_ambulancias';
import { useUsuarios } from '../../users/hooks/use_usuarios';
import type { EstadoChequeo, FiltrosChequeos } from '../types/chequeo_diario.types';

const OPCIONES_ESTADO = ESTADOS_CHEQUEO.map((estado) => ({ valor: estado, texto: ETIQUETAS_ESTADO_CHEQUEO[estado] }));

interface PropiedadesBarraFiltrosChequeos {
  filtros: FiltrosChequeos;
  hayFiltrosActivos: boolean;
  /** `GET /usuarios` es solo del administrador: sin él no se ofrece el filtro por conductor. */
  puedeFiltrarConductor: boolean;
  alCambiar: (cambios: Partial<Omit<FiltrosChequeos, 'limite'>>) => void;
}

function CampoDia({
  etiqueta,
  valor,
  minimo,
  maximo,
  alCambiar,
}: {
  etiqueta: string;
  valor?: string;
  minimo?: string;
  maximo?: string;
  alCambiar: (valor: string | undefined) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-texto-secundario">
      {etiqueta}
      <input
        type="date"
        value={valor ?? ''}
        min={minimo}
        max={maximo}
        onChange={(evento) => alCambiar(evento.target.value || undefined)}
        className={`${claseControlFiltro} min-w-0 flex-1 px-3 sm:w-40 sm:flex-none`}
      />
    </label>
  );
}

export function BarraFiltrosChequeos({
  filtros,
  hayFiltrosActivos,
  puedeFiltrarConductor,
  alCambiar,
}: PropiedadesBarraFiltrosChequeos) {
  const flota = useFlota();
  const conductores = useUsuarios({ rol: 'conductor', pagina: 1, limite: LIMITE_CONDUCTORES }, puedeFiltrarConductor);

  const opcionesAmbulancia = (flota.data?.datos ?? [])
    .map((ambulancia) => ({ valor: ambulancia.id, texto: ambulancia.codigo }))
    .sort((a, b) => a.texto.localeCompare(b.texto, 'es', { numeric: true }));
  const opcionesConductor = (conductores.data?.datos ?? []).map((conductor) => ({
    valor: conductor.id,
    texto: `${conductor.nombres} ${conductor.apellidos}`,
  }));

  return (
    <div role="search" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <SelectorFiltro<string>
          etiqueta="Filtrar por ambulancia"
          valor={filtros.ambulanciaId}
          opciones={opcionesAmbulancia}
          textoTodos="Todas las ambulancias"
          deshabilitado={!flota.isSuccess}
          alCambiar={(ambulanciaId) => alCambiar({ ambulanciaId })}
        />
        {puedeFiltrarConductor && (
          <SelectorFiltro<string>
            etiqueta="Filtrar por conductor"
            valor={filtros.conductorId}
            opciones={opcionesConductor}
            textoTodos="Todos los conductores"
            deshabilitado={!conductores.isSuccess}
            alCambiar={(conductorId) => alCambiar({ conductorId })}
          />
        )}
        <SelectorFiltro<EstadoChequeo>
          etiqueta="Filtrar por estado"
          valor={filtros.estado}
          opciones={OPCIONES_ESTADO}
          textoTodos="Todos los estados"
          alCambiar={(estado) => alCambiar({ estado })}
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <CampoDia etiqueta="Desde" valor={filtros.desde} maximo={filtros.hasta} alCambiar={(desde) => alCambiar({ desde })} />
        <CampoDia etiqueta="Hasta" valor={filtros.hasta} minimo={filtros.desde} alCambiar={(hasta) => alCambiar({ hasta })} />
      </div>
      {hayFiltrosActivos && (
        <button
          type="button"
          onClick={() =>
            alCambiar({ ambulanciaId: undefined, conductorId: undefined, estado: undefined, desde: undefined, hasta: undefined })
          }
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-sm text-texto-secundario transition-colors duration-150 hover:bg-white/70 hover:text-texto"
        >
          <X aria-hidden strokeWidth={1.75} className="size-4" />
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
