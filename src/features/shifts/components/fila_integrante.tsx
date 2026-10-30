import { ChevronDown, Trash2 } from 'lucide-react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { claseEstadoEntrada } from '../../../components/forms/estilos_campo';
import { ETIQUETAS_FUNCION, FUNCIONES } from '../constants/turnos';
import type { OpcionPersona } from '../types/turno.types';

interface PropiedadesFilaIntegrante {
  indice: number;
  registroFuncion: UseFormRegisterReturn;
  registroPersona: UseFormRegisterReturn;
  opciones: OpcionPersona[];
  error?: string;
  deshabilitada: boolean;
  /** Sin valor, la fila no se puede quitar (mínimo de tripulantes). */
  alQuitar?: () => void;
}

const claseSelector =
  'campo-vidrio h-11 w-full appearance-none rounded-xl pr-9 pl-3 text-sm text-texto transition-[border-color,box-shadow] duration-150 focus:bg-white focus:ring-4 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60';

function Flecha() {
  return (
    <ChevronDown
      aria-hidden
      strokeWidth={1.75}
      className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-texto-secundario"
    />
  );
}

export function FilaIntegrante({
  indice,
  registroFuncion,
  registroPersona,
  opciones,
  error,
  deshabilitada,
  alQuitar,
}: PropiedadesFilaIntegrante) {
  const idPersona = `integrante-${indice}-persona`;
  const idError = `error-${idPersona}`;

  return (
    <li className="space-y-1.5">
      <div className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_auto] items-center gap-2">
        <div className="relative">
          <select
            aria-label={`Función del tripulante ${indice + 1}`}
            disabled={deshabilitada}
            className={`${claseSelector} ${claseEstadoEntrada(false)}`}
            {...registroFuncion}
          >
            {FUNCIONES.map((funcion) => (
              <option key={funcion} value={funcion}>
                {ETIQUETAS_FUNCION[funcion]}
              </option>
            ))}
          </select>
          <Flecha />
        </div>
        <div className="relative">
          <select
            id={idPersona}
            aria-label={`Persona del tripulante ${indice + 1}`}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? idError : undefined}
            disabled={deshabilitada}
            className={`${claseSelector} ${claseEstadoEntrada(Boolean(error))}`}
            {...registroPersona}
          >
            <option value="" disabled>
              Selecciona a la persona
            </option>
            {opciones.map(({ usuarioId, nombre, noDisponible }) => (
              <option key={usuarioId} value={usuarioId} disabled={Boolean(noDisponible)}>
                {noDisponible ? `${nombre} — ${noDisponible}` : nombre}
              </option>
            ))}
          </select>
          <Flecha />
        </div>
        {alQuitar ? (
          <button
            type="button"
            onClick={alQuitar}
            disabled={deshabilitada}
            aria-label={`Quitar al tripulante ${indice + 1}`}
            title="Quitar"
            className="flex size-11 items-center justify-center rounded-xl text-texto-secundario transition-colors duration-150 hover:bg-critico/6 hover:text-critico disabled:opacity-40"
          >
            <Trash2 aria-hidden strokeWidth={1.75} className="size-4" />
          </button>
        ) : (
          <span aria-hidden className="size-11" />
        )}
      </div>
      {error && (
        <p id={idError} className="pl-[calc(9rem+0.5rem)] text-[13px] text-critico max-sm:pl-0">
          {error}
        </p>
      )}
    </li>
  );
}
