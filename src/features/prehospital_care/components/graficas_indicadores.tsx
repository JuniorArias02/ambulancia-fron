import { useState, type ReactNode } from 'react';
import { dominioConMarcas } from '../utils/geometria_grafica';

/** Paleta categórica validada (orden fijo por entidad, nunca por rango). */
const CATEGORICOS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4'] as const;
/** Texto dentro de un bloque: blanco, salvo sobre el amarillo. */
const TEXTO_SOBRE = ['#ffffff', '#ffffff', '#ffffff', '#0b0b0b', '#ffffff'] as const;
const COLOR_SIN_DATO = '#94A3B8';
const COLOR_UNICO = '#2563EB';

const formatoNumero = new Intl.NumberFormat('es-CO');
const formatoPorcentaje = new Intl.NumberFormat('es-CO', { style: 'percent', maximumFractionDigits: 0 });

export interface Parte {
  clave: string;
  nombre: string;
  total: number;
  /** Índice de la entidad en su catálogo: fija su color. `null` es "Sin dato". */
  indiceColor: number | null;
  /** Sin valor no se puede abrir en la bandeja (p. ej. "Sin dato"). */
  alElegir?: () => void;
}

const colorDe = (indice: number | null) => (indice === null ? COLOR_SIN_DATO : (CATEGORICOS[indice % CATEGORICOS.length] ?? COLOR_SIN_DATO));
const textoSobre = (indice: number | null) => (indice === null ? '#0b0b0b' : (TEXTO_SOBRE[indice % TEXTO_SOBRE.length] ?? '#ffffff'));

/** Un total repartido en partes (≤ 6): barra de 28 px con la leyenda como tabla de valores. */
export function BarraSegmentada({ titulo, partes }: { titulo: string; partes: readonly Parte[] }) {
  const total = partes.reduce((suma, parte) => suma + parte.total, 0);
  if (total === 0) return <p className="text-sm text-texto-secundario">Sin historias en el rango.</p>;
  const visibles = partes.filter((parte) => parte.total > 0);
  return (
    <div className="space-y-4">
      <div role="group" aria-label={titulo} className="flex h-7 gap-0.5 overflow-hidden">
        {visibles.map((parte) => {
          const proporcion = parte.total / total;
          const etiqueta = `${parte.nombre}: ${formatoNumero.format(parte.total)} (${formatoPorcentaje.format(proporcion)})`;
          const contenido = proporcion >= 0.1 ? formatoPorcentaje.format(proporcion) : null;
          const estilo = { flexGrow: parte.total, backgroundColor: colorDe(parte.indiceColor), color: textoSobre(parte.indiceColor) };
          const clase = 'flex min-w-1 basis-0 items-center rounded px-2 text-xs font-semibold tabular-nums';
          return parte.alElegir ? (
            <button
              key={parte.clave}
              type="button"
              onClick={parte.alElegir}
              aria-label={`${etiqueta}. Ver en la bandeja`}
              title={etiqueta}
              style={estilo}
              className={`${clase} transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-texto focus-visible:ring-offset-2 focus-visible:outline-none`}
            >
              {contenido}
            </button>
          ) : (
            <span key={parte.clave} role="img" aria-label={etiqueta} title={etiqueta} style={estilo} className={clase}>
              {contenido}
            </span>
          );
        })}
      </div>
      <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {visibles.map((parte) => (
          <li key={parte.clave}>
            <BotonOFila alElegir={parte.alElegir}>
              <span aria-hidden className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: colorDe(parte.indiceColor) }} />
              <span className="min-w-0 flex-1 truncate text-texto">{parte.nombre}</span>
              <span className="text-texto tabular-nums">{formatoNumero.format(parte.total)}</span>
              <span className="w-10 text-right text-texto-secundario tabular-nums">{formatoPorcentaje.format(parte.total / total)}</span>
            </BotonOFila>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BotonOFila({ alElegir, children }: { alElegir?: () => void; children: ReactNode }) {
  const clase = 'flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-left text-[13px]';
  if (!alElegir) return <div className={clase}>{children}</div>;
  return (
    <button
      type="button"
      onClick={alElegir}
      className={`${clase} transition-colors hover:bg-primario/8 focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none`}
    >
      {children}
    </button>
  );
}

export interface FilaRanking {
  clave: string;
  nombre: string;
  total: number;
  /** Color propio de la entidad (p. ej. el del triage); sin valor, el tono único. */
  color?: string;
  alElegir?: () => void;
}

/** Barras horizontales ordenadas: nombre, barra (máx. 10 px de grosor) y valor impreso. */
export function BarrasRanking({ titulo, filas, vacio }: { titulo: string; filas: readonly FilaRanking[]; vacio: string }) {
  const maximo = Math.max(...filas.map((fila) => fila.total), 0);
  if (filas.length === 0 || maximo === 0) return <p className="text-sm text-texto-secundario">{vacio}</p>;
  return (
    <ul aria-label={titulo} className="space-y-1">
      {filas.map((fila) => (
        <li key={fila.clave}>
          <BotonOFila alElegir={fila.alElegir}>
            <span className="w-36 shrink-0 truncate text-texto sm:w-44" title={fila.nombre}>
              {fila.nombre}
            </span>
            <span className="h-2.5 min-w-0 flex-1 rounded-full bg-borde/40">
              <span
                className="block h-full rounded-full"
                style={{ width: `${Math.max((fila.total / maximo) * 100, 2)}%`, backgroundColor: fila.color ?? COLOR_UNICO }}
              />
            </span>
            <span className="w-10 text-right text-texto tabular-nums">{formatoNumero.format(fila.total)}</span>
          </BotonOFila>
        </li>
      ))}
    </ul>
  );
}

interface PropiedadesColumnasPorDia {
  dias: readonly { dia: string; total: number }[];
  alElegir: (dia: string) => void;
}

const textoDia = (dia: string) => `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;

/** Historias por día: columnas (máx. 24 px), eje y con marcas limpias, tooltip y clic al día. */
export function ColumnasPorDia({ dias, alElegir }: PropiedadesColumnasPorDia) {
  const [activo, setActivo] = useState<number | null>(null);
  const { dominio, marcas } = dominioConMarcas(
    dias.map((d) => d.total),
    [0, 1],
  );
  const maximo = Math.max(dominio[1], 1);
  const diaActivo = activo === null ? undefined : dias[activo];
  const ultimo = dias.length - 1;

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div aria-hidden className="relative h-48 w-7 shrink-0">
          {marcas.map((marca) => (
            <span
              key={marca}
              style={{ bottom: `${(marca / maximo) * 100}%` }}
              className="absolute right-0 translate-y-1/2 text-[10px] text-texto-secundario tabular-nums"
            >
              {marca}
            </span>
          ))}
        </div>
        <div className="relative h-48 min-w-0 flex-1" onPointerLeave={() => setActivo(null)}>
          {marcas.map((marca) => (
            <span key={marca} aria-hidden style={{ bottom: `${(marca / maximo) * 100}%` }} className="absolute inset-x-0 h-px bg-borde" />
          ))}
          <div role="group" aria-label="Historias por día" className="relative flex h-full items-end">
            {dias.map((dia, indice) => (
              <button
                key={dia.dia}
                type="button"
                onClick={() => alElegir(dia.dia)}
                onPointerEnter={() => setActivo(indice)}
                onFocus={() => setActivo(indice)}
                onBlur={() => setActivo(null)}
                aria-label={`${textoDia(dia.dia)}: ${dia.total} ${dia.total === 1 ? 'historia' : 'historias'}. Ver en la bandeja`}
                className="group flex h-full min-w-0 flex-1 items-end justify-center focus-visible:outline-none"
              >
                <span
                  style={{ height: `${(dia.total / maximo) * 100}%` }}
                  className={`block w-[70%] max-w-6 rounded-t transition-colors group-focus-visible:ring-2 group-focus-visible:ring-primario/50 ${
                    activo === indice ? 'bg-primario-hover' : 'bg-primario'
                  } ${dia.total === 0 ? 'min-h-0' : 'min-h-0.5'}`}
                />
              </button>
            ))}
          </div>
          {diaActivo && activo !== null && (
            <div
              role="status"
              style={{ left: `${((activo + 0.5) / dias.length) * 100}%` }}
              className="vidrio-fuerte pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-xl px-3 py-1.5 text-xs whitespace-nowrap"
            >
              <span className="font-medium text-texto tabular-nums">{textoDia(diaActivo.dia)}</span>
              <span className="text-texto-secundario"> · {formatoNumero.format(diaActivo.total)} {diaActivo.total === 1 ? 'historia' : 'historias'}</span>
            </div>
          )}
        </div>
      </div>
      <div aria-hidden className="mt-1.5 flex justify-between pl-9 text-[10px] text-texto-secundario tabular-nums">
        {dias[0] && <span>{textoDia(dias[0].dia)}</span>}
        {ultimo > 1 && dias[Math.floor(ultimo / 2)] && <span>{textoDia(dias[Math.floor(ultimo / 2)]?.dia ?? '')}</span>}
        {ultimo > 0 && dias[ultimo] && <span>{textoDia(dias[ultimo]?.dia ?? '')}</span>}
      </div>
    </div>
  );
}
