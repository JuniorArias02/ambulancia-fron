import { Activity, CircleAlert, TriangleAlert } from 'lucide-react';
import { useMemo } from 'react';
import type { SignoVital } from '../types/historia_clinica.types';
import { formatearFechaHora } from '../utils/formato_clinico';
import { nivelSigno, type NivelSigno, type SignoEvaluable } from '../utils/rangos_signos';
import { GraficaSignosVitales } from './grafica_signos_vitales';
import { Bloque, SinDato } from './valor_o_dato';

const CLASES_NIVEL: Record<Exclude<NivelSigno, 'normal'>, string> = {
  advertencia: 'bg-advertencia/10 font-semibold text-advertencia',
  critico: 'bg-critico/10 font-semibold text-critico',
};

/** Valor de una celda; fuera de rango se resalta con color e icono (nunca solo color). */
function Valor({ valor, signo, texto }: { valor: number | null; signo?: SignoEvaluable; texto?: string }) {
  if (valor === null) return <SinDato />;
  const nivel = signo ? nivelSigno(signo, valor) : null;
  const contenido = texto ?? String(valor);
  if (!nivel || nivel === 'normal') return <span className="tabular-nums">{contenido}</span>;
  const Icono = nivel === 'critico' ? CircleAlert : TriangleAlert;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 tabular-nums ${CLASES_NIVEL[nivel]}`}>
      <Icono aria-hidden strokeWidth={2} className="size-3" />
      {contenido}
      <span className="sr-only">(fuera del rango de referencia)</span>
    </span>
  );
}

function textoGlasgow(toma: SignoVital): string | undefined {
  if (toma.glasgowTotal === null) return undefined;
  const partes = [
    toma.glasgowOcular !== null ? `O${toma.glasgowOcular}` : null,
    toma.glasgowVerbal !== null ? `V${toma.glasgowVerbal}` : null,
    toma.glasgowMotor !== null ? `M${toma.glasgowMotor}` : null,
  ].filter(Boolean);
  return partes.length > 0 ? `${toma.glasgowTotal} (${partes.join(' ')})` : String(toma.glasgowTotal);
}

function PresionArterial({ toma }: { toma: SignoVital }) {
  if (toma.presionSistolica === null && toma.presionDiastolica === null) return <SinDato />;
  return (
    <span className="inline-flex items-center gap-0.5 whitespace-nowrap">
      <Valor valor={toma.presionSistolica} signo="presionSistolica" />/
      {toma.presionDiastolica === null ? '—' : <span className="tabular-nums">{toma.presionDiastolica}</span>}
    </span>
  );
}

const claseCelda = 'px-3 py-2.5 text-sm whitespace-nowrap';

export function SeccionSignosVitales({ signos }: { signos: readonly SignoVital[] }) {
  const tomas = useMemo(
    () => [...signos].sort((a, b) => new Date(a.medidoEn).getTime() - new Date(b.medidoEn).getTime()),
    [signos],
  );

  if (tomas.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-texto-secundario">
        <Activity aria-hidden strokeWidth={1.75} className="size-4" />
        No se registraron signos vitales.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <Bloque titulo="Tendencia">
        {tomas.length < 2 ? (
          <p className="text-[13px] text-texto-secundario">La gráfica aparece desde dos tomas; abajo está la única registrada.</p>
        ) : (
          <GraficaSignosVitales tomas={tomas} />
        )}
      </Bloque>

      <Bloque titulo={`Tomas (${tomas.length})`}>
        <p className="-mt-1 text-xs text-texto-secundario">
          Resaltado en ámbar o rojo: fuera del rango de referencia del adulto. Es solo una ayuda visual.
        </p>
        <div className="overflow-x-auto rounded-xl border border-borde/70 bg-white/70">
          <table className="w-full min-w-[920px] text-left">
            <thead>
              <tr className="border-b border-borde/80 text-xs tracking-wide text-texto-secundario uppercase">
                <th scope="col" className="px-3 py-2.5 font-medium">Hora</th>
                <th scope="col" className="px-3 py-2.5 font-medium">TA (mmHg)</th>
                <th scope="col" className="px-3 py-2.5 font-medium">FC</th>
                <th scope="col" className="px-3 py-2.5 font-medium">FR</th>
                <th scope="col" className="px-3 py-2.5 font-medium">SpO₂ %</th>
                <th scope="col" className="px-3 py-2.5 font-medium">T °C</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Glucometría</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Glasgow</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Dolor</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Registró</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borde/60">
              {tomas.map((toma) => (
                <tr key={toma.id}>
                  <td className={`${claseCelda} text-[13px] tabular-nums`}>
                    <time dateTime={toma.medidoEn}>{formatearFechaHora(toma.medidoEn)}</time>
                  </td>
                  <td className={claseCelda}>
                    <PresionArterial toma={toma} />
                  </td>
                  <td className={claseCelda}>
                    <Valor valor={toma.frecuenciaCardiaca} signo="frecuenciaCardiaca" />
                  </td>
                  <td className={claseCelda}>
                    <Valor valor={toma.frecuenciaRespiratoria} signo="frecuenciaRespiratoria" />
                  </td>
                  <td className={claseCelda}>
                    <Valor valor={toma.saturacionOxigeno} signo="saturacionOxigeno" />
                  </td>
                  <td className={claseCelda}>
                    <Valor valor={toma.temperatura} signo="temperatura" />
                  </td>
                  <td className={claseCelda}>
                    <Valor valor={toma.glucometria} texto={toma.glucometria === null ? undefined : `${toma.glucometria} mg/dL`} />
                  </td>
                  <td className={claseCelda}>
                    <Valor valor={toma.glasgowTotal} signo="glasgowTotal" texto={textoGlasgow(toma)} />
                  </td>
                  <td className={claseCelda}>
                    <Valor valor={toma.escalaDolor} texto={toma.escalaDolor === null ? undefined : `${toma.escalaDolor}/10`} />
                  </td>
                  <td className={`${claseCelda} text-[13px] text-texto-secundario`}>
                    {toma.registradoPor.nombreCompleto ?? <SinDato />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Bloque>
    </div>
  );
}
