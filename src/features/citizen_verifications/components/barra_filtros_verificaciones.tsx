import { ListChecks, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { claseControlFiltro } from '../../../components/forms/selector_filtro';
import { SelectorSegmentado, type OpcionSegmentada } from '../../../components/ui/selector_segmentado';
import { useValorRetrasado } from '../../../hooks/use_valor_retrasado';
import { ESTILOS_ESTADO_VERIFICACION } from '../constants/estilos_verificacion';
import {
  ESTADOS_VERIFICACION,
  ETIQUETAS_FILTRO_ESTADO,
  LONGITUD_MAXIMA_BUSQUEDA,
} from '../constants/verificaciones';
import type { PestanaVerificacion } from '../hooks/use_filtros_verificaciones';

const RETRASO_BUSQUEDA_MS = 350;

const OPCIONES_PESTANA: OpcionSegmentada<PestanaVerificacion>[] = [
  ...ESTADOS_VERIFICACION.map((estado) => ({
    valor: estado,
    texto: ETIQUETAS_FILTRO_ESTADO[estado],
    icono: ESTILOS_ESTADO_VERIFICACION[estado].icono,
  })),
  { valor: 'todas', texto: 'Todas', icono: ListChecks },
];

interface PropiedadesBarraFiltrosVerificaciones {
  pestana: PestanaVerificacion;
  busqueda: string;
  alCambiarPestana: (pestana: PestanaVerificacion) => void;
  alBuscar: (texto: string) => void;
}

export function BarraFiltrosVerificaciones({
  pestana,
  busqueda: busquedaAplicada,
  alCambiarPestana,
  alBuscar,
}: PropiedadesBarraFiltrosVerificaciones) {
  const [busqueda, setBusqueda] = useState(busquedaAplicada);
  const busquedaRetrasada = useValorRetrasado(busqueda.trim(), RETRASO_BUSQUEDA_MS);

  useEffect(() => {
    if (busquedaRetrasada !== busquedaAplicada) alBuscar(busquedaRetrasada);
  }, [busquedaRetrasada, busquedaAplicada, alBuscar]);

  return (
    <div className="flex flex-col gap-3">
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <SelectorSegmentado
          etiqueta="Filtrar por estado"
          valor={pestana}
          opciones={OPCIONES_PESTANA}
          alCambiar={alCambiarPestana}
        />
      </div>
      <div role="search" className="relative max-w-xl">
        <Search
          aria-hidden
          strokeWidth={1.75}
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-texto-secundario"
        />
        <input
          type="search"
          value={busqueda}
          maxLength={LONGITUD_MAXIMA_BUSQUEDA}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Buscar por nombre, número de documento o correo"
          aria-label="Buscar solicitudes"
          autoComplete="off"
          className={`${claseControlFiltro} w-full pr-3 pl-10 placeholder:text-texto-secundario/80`}
        />
      </div>
    </div>
  );
}
