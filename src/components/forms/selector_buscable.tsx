import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';

import { filtrarOpciones, type OpcionBuscable } from '../../utils/opciones_buscables';

export type { OpcionBuscable };

/** Más opciones que estas no se dibujan: se pide afinar la búsqueda. */
const MAXIMO_VISIBLES = 60;

export interface PropiedadesSelectorBuscable {
  id?: string;
  opciones: readonly OpcionBuscable[];
  valor: string;
  alCambiar: (valor: string) => void;
  /** Para marcar el campo como tocado en un formulario. */
  alSalir?: () => void;
  placeholder: string;
  /** Nombre accesible cuando no hay un `<label>` asociado. */
  etiqueta?: string;
  deshabilitado?: boolean;
  invalido?: boolean;
  /** Ids de los textos de ayuda o error, para `aria-describedby`. */
  descripcion?: string;
  textoSinResultados?: string;
  /** Clases de la caja de texto: tamaño, bordes y espacio para iconos. */
  claseEntrada: string;
}

/**
 * Selector con buscador (patrón combobox): al escribir filtra la lista, se recorre con las
 * flechas y se elige con Enter o con un clic. Escape cierra sin cambiar la elección.
 */
export function SelectorBuscable({
  id,
  opciones,
  valor,
  alCambiar,
  alSalir,
  placeholder,
  etiqueta,
  deshabilitado = false,
  invalido = false,
  descripcion,
  textoSinResultados = 'Sin resultados',
  claseEntrada,
}: PropiedadesSelectorBuscable) {
  const idGenerado = useId();
  const idEntrada = id ?? idGenerado;
  const idLista = `${idEntrada}-opciones`;
  const listaRef = useRef<HTMLUListElement>(null);
  const [abierto, setAbierto] = useState(false);
  // `null`: no se está escribiendo; la caja muestra la opción elegida.
  const [consulta, setConsulta] = useState<string | null>(null);
  const [activo, setActivo] = useState(0);

  const elegida = opciones.find((opcion) => opcion.valor === valor);
  const filtradas = useMemo(() => filtrarOpciones(opciones, consulta ?? ''), [opciones, consulta]);
  const visibles = filtradas.slice(0, MAXIMO_VISIBLES);
  const ocultas = filtradas.length - visibles.length;
  const indiceActivo = Math.min(activo, Math.max(visibles.length - 1, 0));
  const opcionActiva = abierto ? visibles[indiceActivo] : undefined;
  const idOpcion = (indice: number) => `${idEntrada}-opcion-${indice}`;

  // Mantiene visible la opción activa al recorrer la lista con el teclado.
  useEffect(() => {
    if (!abierto) return;
    const elemento = listaRef.current?.querySelector<HTMLElement>(`[data-indice="${indiceActivo}"]`);
    elemento?.scrollIntoView?.({ block: 'nearest' });
  }, [abierto, indiceActivo]);

  const abrir = () => {
    if (deshabilitado) return;
    // Al abrir, la opción elegida queda activa para seguir desde ahí.
    const posicion = visibles.findIndex((opcion) => opcion.valor === valor);
    setActivo(posicion >= 0 && consulta === null ? posicion : 0);
    setAbierto(true);
  };

  const cerrar = () => {
    setAbierto(false);
    setConsulta(null);
  };

  const elegir = (opcion: OpcionBuscable | undefined) => {
    if (!opcion || opcion.deshabilitada) return;
    alCambiar(opcion.valor);
    cerrar();
  };

  const mover = (paso: 1 | -1) => {
    if (!abierto) {
      abrir();
      return;
    }
    if (visibles.length === 0) return;
    let siguiente = indiceActivo;
    // Salta las opciones deshabilitadas.
    for (let intento = 0; intento < visibles.length; intento += 1) {
      siguiente = (siguiente + paso + visibles.length) % visibles.length;
      if (!visibles[siguiente]?.deshabilitada) break;
    }
    setActivo(siguiente);
  };

  const alTeclear = (evento: KeyboardEvent<HTMLInputElement>) => {
    switch (evento.key) {
      case 'ArrowDown':
        evento.preventDefault();
        mover(1);
        break;
      case 'ArrowUp':
        evento.preventDefault();
        mover(-1);
        break;
      case 'Enter':
        // Con la lista abierta, Enter elige; no envía el formulario.
        if (abierto) {
          evento.preventDefault();
          elegir(opcionActiva);
        }
        break;
      case 'Escape':
        // Cierra la lista sin cerrar el diálogo que la contiene.
        if (abierto) {
          evento.preventDefault();
          evento.stopPropagation();
          cerrar();
        }
        break;
      case 'Tab':
        cerrar();
        break;
    }
  };

  return (
    <>
      <input
        id={idEntrada}
        type="text"
        role="combobox"
        autoComplete="off"
        spellCheck={false}
        aria-label={etiqueta}
        aria-expanded={abierto}
        aria-controls={idLista}
        aria-autocomplete="list"
        aria-activedescendant={opcionActiva ? idOpcion(indiceActivo) : undefined}
        aria-invalid={invalido ? true : undefined}
        aria-describedby={descripcion}
        disabled={deshabilitado}
        placeholder={placeholder}
        value={consulta ?? elegida?.texto ?? ''}
        onFocus={(evento) => {
          evento.target.select();
          abrir();
        }}
        onClick={() => {
          if (!abierto) abrir();
        }}
        onChange={(evento) => {
          setConsulta(evento.target.value);
          setActivo(0);
          setAbierto(true);
        }}
        onKeyDown={alTeclear}
        onBlur={() => {
          cerrar();
          alSalir?.();
        }}
        className={`${claseEntrada} pr-10 text-ellipsis`}
      />
      <ChevronDown
        aria-hidden
        strokeWidth={1.75}
        className={`pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-texto-secundario transition-transform duration-150 ${
          abierto ? 'rotate-180' : ''
        }`}
      />
      {abierto && (
        <ul
          ref={listaRef}
          id={idLista}
          role="listbox"
          aria-label={etiqueta}
          className="vidrio-fuerte absolute inset-x-0 top-full z-30 mt-1.5 max-h-64 overflow-y-auto rounded-xl p-1 shadow-vidrio-elevado"
        >
          {visibles.length === 0 ? (
            <li role="presentation" className="px-3 py-2.5 text-sm text-texto-secundario">
              {consulta ? `${textoSinResultados} para «${consulta}».` : textoSinResultados}
            </li>
          ) : (
            visibles.map((opcion, indice) => {
              const marcada = opcion.valor === valor;
              const resaltada = indice === indiceActivo;
              return (
                <li
                  key={opcion.valor}
                  id={idOpcion(indice)}
                  data-indice={indice}
                  role="option"
                  aria-selected={marcada}
                  aria-disabled={opcion.deshabilitada || undefined}
                  // Evita que el clic quite el foco antes de elegir.
                  onMouseDown={(evento) => evento.preventDefault()}
                  onMouseEnter={() => setActivo(indice)}
                  onClick={() => elegir(opcion)}
                  className={`flex cursor-pointer items-start gap-2 rounded-lg px-3 py-2 text-sm ${
                    opcion.deshabilitada ? 'cursor-not-allowed opacity-50' : resaltada ? 'bg-primario/8' : ''
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className={`block ${marcada ? 'font-semibold text-primario' : 'text-texto'}`}>{opcion.texto}</span>
                    {opcion.detalle && <span className="block text-xs text-texto-secundario">{opcion.detalle}</span>}
                  </span>
                  {marcada && <Check aria-hidden strokeWidth={2} className="mt-0.5 size-4 shrink-0 text-primario" />}
                </li>
              );
            })
          )}
          {ocultas > 0 && (
            <li role="presentation" className="px-3 py-2 text-xs text-texto-secundario">
              Hay {ocultas} más: escribe para afinar la búsqueda.
            </li>
          )}
        </ul>
      )}
    </>
  );
}
