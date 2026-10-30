import type { UseFormRegisterReturn } from 'react-hook-form';
import { DESCRIPCIONES_PRIORIDAD, ETIQUETAS_PRIORIDAD, PRIORIDADES } from '../constants/catalogos_emergencia';
import { ESTILO_SIN_PRIORIDAD, ESTILOS_PRIORIDAD } from '../constants/estilos_emergencia';
import type { PrioridadEmergencia } from '../types/emergencia.types';

interface PropiedadesSelectorPrioridad {
  valor: PrioridadEmergencia | '';
  registro: UseFormRegisterReturn<'prioridad'>;
}

const OPCIONES: { valor: PrioridadEmergencia | ''; texto: string; detalle: string }[] = [
  ...PRIORIDADES.map((prioridad) => ({
    valor: prioridad,
    texto: ETIQUETAS_PRIORIDAD[prioridad],
    detalle: DESCRIPCIONES_PRIORIDAD[prioridad],
  })),
  { valor: '', texto: 'Sin clasificar', detalle: 'Se define después' },
];

const SELECCION: Record<PrioridadEmergencia | 'ninguna', string> = {
  roja: 'border-critico/50 bg-critico/8 ring-1 ring-critico/20',
  amarilla: 'border-advertencia/50 bg-advertencia/10 ring-1 ring-advertencia/20',
  verde: 'border-exito/50 bg-exito/8 ring-1 ring-exito/20',
  ninguna: 'border-texto-secundario/40 bg-texto-secundario/8 ring-1 ring-texto-secundario/15',
};

/** Prioridad de triaje como opciones visibles: se elige con un solo clic bajo presión. */
export function SelectorPrioridad({ valor, registro }: PropiedadesSelectorPrioridad) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-texto">Prioridad</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {OPCIONES.map((opcion) => {
          const { icono: Icono, clases } = opcion.valor ? ESTILOS_PRIORIDAD[opcion.valor] : ESTILO_SIN_PRIORIDAD;
          const seleccionada = opcion.valor === valor;
          return (
            <label
              key={opcion.valor || 'ninguna'}
              className={`flex cursor-pointer flex-col gap-1.5 rounded-xl border px-3 py-2.5 transition-colors duration-150 has-focus-visible:ring-2 has-focus-visible:ring-primario/40 has-disabled:cursor-not-allowed has-disabled:opacity-60 ${
                seleccionada ? SELECCION[opcion.valor || 'ninguna'] : 'border-borde/80 bg-white/50 hover:bg-white'
              }`}
            >
              <input type="radio" value={opcion.valor} className="sr-only" {...registro} />
              <span className={`inline-flex size-6 items-center justify-center rounded-lg ${clases}`}>
                <Icono aria-hidden strokeWidth={2.25} className="size-3.5" />
              </span>
              <span className="text-sm leading-tight font-medium text-texto">{opcion.texto}</span>
              <span className="text-xs leading-tight text-texto-secundario">{opcion.detalle}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
