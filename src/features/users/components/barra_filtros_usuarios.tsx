import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { claseControlFiltro, SelectorFiltro } from '../../../components/forms/selector_filtro';
import { ETIQUETAS_ROL } from '../../../constants/roles';
import { useValorRetrasado } from '../../../hooks/use_valor_retrasado';
import { NOMBRES_ROLES, type NombreRol } from '../../../types/rol.types';
import { ESTADOS_USUARIO, ETIQUETAS_ESTADO } from '../constants/estados_usuario';
import type { EstadoUsuario, FiltrosUsuarios } from '../types/usuario.types';

const RETRASO_BUSQUEDA_MS = 350;

const OPCIONES_ESTADO = ESTADOS_USUARIO.map((estado) => ({ valor: estado, texto: ETIQUETAS_ESTADO[estado] }));
const OPCIONES_ROL = NOMBRES_ROLES.map((rol) => ({ valor: rol, texto: ETIQUETAS_ROL[rol] }));

interface PropiedadesBarraFiltrosUsuarios {
  filtros: FiltrosUsuarios;
  hayFiltrosActivos: boolean;
  alCambiar: (cambios: Partial<Omit<FiltrosUsuarios, 'limite'>>) => void;
}

export function BarraFiltrosUsuarios({
  filtros,
  hayFiltrosActivos,
  alCambiar,
}: PropiedadesBarraFiltrosUsuarios) {
  const [busqueda, setBusqueda] = useState(filtros.busqueda ?? '');
  const busquedaRetrasada = useValorRetrasado(busqueda.trim(), RETRASO_BUSQUEDA_MS);

  useEffect(() => {
    if (busquedaRetrasada !== (filtros.busqueda ?? '')) {
      alCambiar({ busqueda: busquedaRetrasada || undefined });
    }
  }, [busquedaRetrasada, filtros.busqueda, alCambiar]);

  const limpiar = () => {
    setBusqueda('');
    alCambiar({ busqueda: undefined, estado: undefined, rol: undefined });
  };

  return (
    <div role="search" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative min-w-0 flex-1 sm:min-w-64">
        <Search
          aria-hidden
          strokeWidth={1.75}
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-texto-secundario"
        />
        <input
          type="search"
          value={busqueda}
          maxLength={100}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Buscar por nombre, apellido o correo"
          aria-label="Buscar usuarios"
          className={`${claseControlFiltro} w-full pr-3 pl-10 placeholder:text-texto-secundario/80`}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex">
        <SelectorFiltro<EstadoUsuario>
          etiqueta="Filtrar por estado"
          valor={filtros.estado}
          opciones={OPCIONES_ESTADO}
          textoTodos="Todos los estados"
          alCambiar={(estado) => alCambiar({ estado })}
        />
        <SelectorFiltro<NombreRol>
          etiqueta="Filtrar por rol"
          valor={filtros.rol}
          opciones={OPCIONES_ROL}
          textoTodos="Todos los roles"
          alCambiar={(rol) => alCambiar({ rol })}
        />
      </div>

      {hayFiltrosActivos && (
        <button
          type="button"
          onClick={limpiar}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-sm text-texto-secundario transition-colors duration-150 hover:bg-white/70 hover:text-texto"
        >
          <X aria-hidden strokeWidth={1.75} className="size-4" />
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
