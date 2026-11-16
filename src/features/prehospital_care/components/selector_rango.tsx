import { CalendarDays, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { claseControlFiltro } from '../../../components/forms/selector_filtro';
import { atajoDeRango, rangoDeAtajo, type AtajoRango } from '../utils/rangos_fecha';

const PERSONALIZADO = 'personalizado';

interface PropiedadesSelectorRango {
  desde: string;
  hasta: string;
  atajos: readonly { valor: AtajoRango; texto: string }[];
  alCambiar: (rango: { desde: string | undefined; hasta: string | undefined }) => void;
}

/** Rango de días de Colombia con atajos o fechas personalizadas. Montarlo con `key` del rango. */
export function SelectorRango({ desde, hasta, atajos, alCambiar }: PropiedadesSelectorRango) {
  const atajo = atajoDeRango({ desde, hasta }, undefined, atajos);
  const [personalizado, setPersonalizado] = useState(atajo === null);
  const valor = personalizado || atajo === null ? PERSONALIZADO : atajo;

  const elegir = (nuevo: string) => {
    if (nuevo === PERSONALIZADO) {
      setPersonalizado(true);
      return;
    }
    const elegido = atajos.find((opcion) => opcion.valor === nuevo)?.valor;
    if (!elegido) return;
    setPersonalizado(false);
    alCambiar(rangoDeAtajo(elegido));
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <CalendarDays
          aria-hidden
          strokeWidth={1.75}
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-texto-secundario"
        />
        <select
          aria-label="Rango de fechas"
          value={valor}
          onChange={(evento) => elegir(evento.target.value)}
          className={`${claseControlFiltro} appearance-none pr-9 pl-9 font-medium`}
        >
          {atajos.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.texto}
            </option>
          ))}
          <option value={PERSONALIZADO}>Personalizado</option>
        </select>
        <ChevronDown
          aria-hidden
          strokeWidth={1.75}
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-texto-secundario"
        />
      </div>
      {valor === PERSONALIZADO && (
        <>
          <label className="flex items-center gap-2 text-[13px] text-texto-secundario">
            Desde
            <input
              type="date"
              value={desde}
              max={hasta || undefined}
              onChange={(evento) => alCambiar({ desde: evento.target.value || undefined, hasta })}
              className={`${claseControlFiltro} px-3`}
            />
          </label>
          <label className="flex items-center gap-2 text-[13px] text-texto-secundario">
            Hasta
            <input
              type="date"
              value={hasta}
              min={desde || undefined}
              onChange={(evento) => alCambiar({ desde, hasta: evento.target.value || undefined })}
              className={`${claseControlFiltro} px-3`}
            />
          </label>
        </>
      )}
    </div>
  );
}
