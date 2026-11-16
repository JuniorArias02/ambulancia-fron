import { useId, useMemo, useState, type PointerEvent } from 'react';
import type { SignoVital } from '../types/historia_clinica.types';
import { formatearHora } from '../utils/formato_clinico';
import { dominioConMarcas, escalaLineal, indiceMasCercano, tramos } from '../utils/geometria_grafica';
import { nivelSigno, type SignoEvaluable } from '../utils/rangos_signos';

type CampoGrafica = 'presionSistolica' | 'presionDiastolica' | 'frecuenciaCardiaca' | 'frecuenciaRespiratoria' | 'saturacionOxigeno';

interface Serie {
  campo: CampoGrafica;
  nombre: string;
  corto: string;
  color: string;
  /** Segunda codificación (además del color) cuando hay dos series en el mismo panel. */
  discontinua?: boolean;
  /** Si el valor se compara con los rangos de referencia. */
  evalua?: SignoEvaluable;
}

interface Panel {
  clave: string;
  titulo: string;
  unidad: string;
  /** Rango normal del adulto, para la banda de referencia. */
  banda: [number, number];
  series: Serie[];
}

// Azul y cian validados para daltonismo; el cian además va punteado y con etiqueta directa.
const AZUL = '#2563EB';
const CIAN = '#0891B2';
const COLOR_ADVERTENCIA = '#D97706';
const COLOR_CRITICO = '#DC2626';

const PANELES: Panel[] = [
  {
    clave: 'ta',
    titulo: 'Presión arterial',
    unidad: 'mmHg',
    banda: [90, 139],
    series: [
      { campo: 'presionSistolica', nombre: 'Sistólica', corto: 'Sist.', color: AZUL, evalua: 'presionSistolica' },
      { campo: 'presionDiastolica', nombre: 'Diastólica', corto: 'Diast.', color: CIAN, discontinua: true },
    ],
  },
  {
    clave: 'fc',
    titulo: 'Frecuencia cardiaca',
    unidad: 'lpm',
    banda: [60, 100],
    series: [{ campo: 'frecuenciaCardiaca', nombre: 'FC', corto: 'FC', color: AZUL, evalua: 'frecuenciaCardiaca' }],
  },
  {
    clave: 'fr',
    titulo: 'Frecuencia respiratoria',
    unidad: 'rpm',
    banda: [12, 20],
    series: [{ campo: 'frecuenciaRespiratoria', nombre: 'FR', corto: 'FR', color: AZUL, evalua: 'frecuenciaRespiratoria' }],
  },
  {
    clave: 'spo2',
    titulo: 'Saturación de oxígeno',
    unidad: '%',
    banda: [94, 100],
    series: [{ campo: 'saturacionOxigeno', nombre: 'SpO₂', corto: 'SpO₂', color: AZUL, evalua: 'saturacionOxigeno' }],
  },
];

const ANCHO = 320;
const ALTO = 150;
const MARGEN = { arriba: 12, derecha: 42, abajo: 24, izquierda: 34 };

function colorMarcador(serie: Serie, valor: number): string {
  const nivel = serie.evalua ? nivelSigno(serie.evalua, valor) : null;
  if (nivel === 'critico') return COLOR_CRITICO;
  if (nivel === 'advertencia') return COLOR_ADVERTENCIA;
  return serie.color;
}

interface PropiedadesPanelGrafica {
  panel: Panel;
  tomas: readonly SignoVital[];
  dominioTiempo: [number, number];
}

function PanelGrafica({ panel, tomas, dominioTiempo }: PropiedadesPanelGrafica) {
  const [activo, setActivo] = useState<number | null>(null);
  const idTitulo = useId();

  const valores = tomas.flatMap((toma) => panel.series.map((serie) => toma[serie.campo]).filter((v): v is number => v !== null));
  const { dominio, marcas } = dominioConMarcas(valores, panel.banda);
  const x = escalaLineal(dominioTiempo, [MARGEN.izquierda, ANCHO - MARGEN.derecha]);
  const y = escalaLineal(dominio, [ALTO - MARGEN.abajo, MARGEN.arriba]);
  const posiciones = tomas.map((toma) => x(new Date(toma.medidoEn).getTime()));

  if (valores.length === 0) {
    return (
      <figure className="flex min-h-40 flex-col rounded-2xl border border-borde/70 bg-white/70 p-4">
        <figcaption className="text-sm font-medium text-texto">{panel.titulo}</figcaption>
        <p className="m-auto text-[13px] text-texto-secundario">Sin tomas registradas</p>
      </figure>
    );
  }

  const mover = (evento: PointerEvent<SVGSVGElement>) => {
    const caja = evento.currentTarget.getBoundingClientRect();
    if (caja.width === 0) return;
    setActivo(indiceMasCercano(posiciones, ((evento.clientX - caja.left) / caja.width) * ANCHO));
  };

  const tomaActiva = activo === null ? undefined : tomas[activo];
  const xActiva = activo === null ? undefined : posiciones[activo];
  const ultima = tomas.length - 1;

  return (
    <figure aria-labelledby={idTitulo} className="relative rounded-2xl border border-borde/70 bg-white/70 p-4">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <figcaption id={idTitulo} className="text-sm font-medium text-texto">
          {panel.titulo} <span className="font-normal text-texto-secundario">({panel.unidad})</span>
        </figcaption>
        {panel.series.length > 1 && (
          <ul aria-label="Leyenda" className="flex gap-3 text-xs text-texto-secundario">
            {panel.series.map((serie) => (
              <li key={serie.campo} className="flex items-center gap-1.5">
                <svg aria-hidden width="16" height="4">
                  <line x1="0" y1="2" x2="16" y2="2" stroke={serie.color} strokeWidth="2" strokeDasharray={serie.discontinua ? '4 3' : undefined} />
                </svg>
                {serie.nombre}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="mb-2 text-xs text-texto-secundario">
        Banda gris: rango normal del adulto ({panel.banda[0]}–{panel.banda[1]})
      </p>

      <svg
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        role="img"
        aria-label={`${panel.titulo}: ${tomas.length} tomas. El detalle está en la tabla.`}
        onPointerMove={mover}
        onPointerLeave={() => setActivo(null)}
        className="w-full touch-none overflow-visible"
      >
        <rect
          x={MARGEN.izquierda}
          width={ANCHO - MARGEN.izquierda - MARGEN.derecha}
          y={y(Math.min(panel.banda[1], dominio[1]))}
          height={Math.max(y(Math.max(panel.banda[0], dominio[0])) - y(Math.min(panel.banda[1], dominio[1])), 0)}
          fill="#64748B"
          opacity="0.08"
        />
        {marcas.map((marca) => (
          <g key={marca}>
            <line x1={MARGEN.izquierda} x2={ANCHO - MARGEN.derecha} y1={y(marca)} y2={y(marca)} stroke="#E2E8F0" strokeWidth="1" />
            <text x={MARGEN.izquierda - 6} y={y(marca)} dy="0.32em" textAnchor="end" className="fill-texto-secundario text-[10px] tabular-nums">
              {marca}
            </text>
          </g>
        ))}
        {[0, ultima].filter((indice, posicion, lista) => lista.indexOf(indice) === posicion).map((indice) => {
          const toma = tomas[indice];
          const posicionX = posiciones[indice];
          if (!toma || posicionX === undefined) return null;
          return (
            <text
              key={toma.id}
              x={posicionX}
              y={ALTO - 6}
              textAnchor={indice === 0 && ultima > 0 ? 'start' : 'end'}
              className="fill-texto-secundario text-[10px] tabular-nums"
            >
              {formatearHora(toma.medidoEn)}
            </text>
          );
        })}

        {xActiva !== undefined && (
          <line x1={xActiva} x2={xActiva} y1={MARGEN.arriba} y2={ALTO - MARGEN.abajo} stroke="#64748B" strokeWidth="1" opacity="0.5" />
        )}

        {panel.series.map((serie) => {
          const conPosicion = tomas.map((toma, indice) => ({ valor: toma[serie.campo], x: posiciones[indice] ?? 0, id: toma.id }));
          const ultimaConValor = [...conPosicion].reverse().find((punto) => punto.valor !== null);
          return (
            <g key={serie.campo}>
              {tramos(conPosicion, (punto) => punto.valor !== null).map((tramo) => (
                <polyline
                  key={tramo[0]?.id}
                  points={tramo.map((punto) => `${punto.x},${y(punto.valor ?? 0)}`).join(' ')}
                  fill="none"
                  stroke={serie.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={serie.discontinua ? '5 4' : undefined}
                />
              ))}
              {conPosicion.map((punto) =>
                punto.valor === null ? null : (
                  <circle key={punto.id} cx={punto.x} cy={y(punto.valor)} r="4" fill={colorMarcador(serie, punto.valor)} stroke="#FFFFFF" strokeWidth="2" />
                ),
              )}
              {panel.series.length > 1 && ultimaConValor && ultimaConValor.valor !== null && (
                <text x={ultimaConValor.x + 8} y={y(ultimaConValor.valor)} dy="0.32em" className="fill-texto-secundario text-[10px]">
                  {serie.corto}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {tomaActiva && xActiva !== undefined && (
        <div
          role="status"
          style={{ left: `${(xActiva / ANCHO) * 100}%` }}
          className="vidrio-fuerte pointer-events-none absolute top-14 z-10 min-w-32 -translate-x-1/2 rounded-xl px-3 py-2 text-xs"
        >
          <p className="font-medium text-texto tabular-nums">{formatearHora(tomaActiva.medidoEn)}</p>
          {panel.series.map((serie) => {
            const valor = tomaActiva[serie.campo];
            return (
              <p key={serie.campo} className="mt-0.5 flex items-center gap-1.5 text-texto-secundario">
                <span aria-hidden style={{ backgroundColor: serie.color }} className="size-2 rounded-full" />
                {serie.nombre}: <span className="font-medium text-texto tabular-nums">{valor === null ? 'Sin dato' : `${valor} ${panel.unidad}`}</span>
              </p>
            );
          })}
        </div>
      )}
    </figure>
  );
}

/** Tendencia de TA, FC, FR y SpO₂: un panel por signo, cada uno con su escala (nunca dos ejes). */
export function GraficaSignosVitales({ tomas }: { tomas: readonly SignoVital[] }) {
  const dominioTiempo = useMemo<[number, number]>(() => {
    const tiempos = tomas.map((toma) => new Date(toma.medidoEn).getTime());
    return [Math.min(...tiempos), Math.max(...tiempos)];
  }, [tomas]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {PANELES.map((panel) => (
        <PanelGrafica key={panel.clave} panel={panel} tomas={tomas} dominioTiempo={dominioTiempo} />
      ))}
    </div>
  );
}
