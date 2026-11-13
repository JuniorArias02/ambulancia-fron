import { ArrowDown, ArrowUp, PackageMinus, PackagePlus, Trash2, Undo2, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { EstadoError } from '../../../components/states/estado_error';
import { Dialogo } from '../../../components/ui/dialogo';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { ETIQUETAS_ESTADO_CONTEO, ETIQUETAS_ESTADO_VERIFICACION, ETIQUETAS_TIPO_VERIFICACION } from '../constants/catalogos_inventario';
import { TONO_ESTADO_CONTEO, TONO_ESTADO_VERIFICACION } from '../constants/estilos_inventario';
import { useVerificacionInventario } from '../hooks/use_consultas_inventario';
import type { Conteo, Movimiento, VerificacionInventario } from '../types/inventario.types';
import { formatearCantidad } from '../utils/formato_inventario';
import { propuestasNovedad, type AccionNovedad, type PropuestaNovedad } from '../utils/novedades_verificacion';
import { Insignia } from './insignia';
import { PanelNuevoMovimiento } from './panel_nuevo_movimiento';
import { RevisionVerificacion } from './revision_verificacion';
import { proponerResolucion } from '../utils/resolucion_revision';

const ICONOS_ACCION: Record<AccionNovedad, LucideIcon> = {
  disminuir: ArrowDown,
  aumentar: ArrowUp,
  reponer: PackagePlus,
  baja: Trash2,
  devolver: Undo2,
};

const TITULOS_ACCION: Record<AccionNovedad, string> = {
  disminuir: 'Ajustar faltante',
  aumentar: 'Ajustar sobrante',
  reponer: 'Reponer faltante',
  baja: 'Dar de baja',
  devolver: 'Devolver a bodega',
};

interface PropiedadesFilaConteo {
  conteo: Conteo;
  verificacion: VerificacionInventario;
  /** Ya revisada: no se ofrecen correcciones. */
  conCorrecciones: boolean;
  alElegir: (propuesta: PropuestaNovedad) => void;
}

function FilaConteo({ conteo, verificacion, conCorrecciones, alElegir }: PropiedadesFilaConteo) {
  const novedad = conteo.estado !== 'conforme';
  const propuestas = conCorrecciones ? propuestasNovedad(verificacion, conteo) : [];
  return (
    <li className={`rounded-2xl border px-4 py-3 ${novedad ? 'border-advertencia/25 bg-advertencia/5' : 'border-borde/70 bg-white/60'}`}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-texto">{conteo.insumoNombre}</p>
          <p className="text-[13px] text-texto-secundario">
            {conteo.numeroLote && `Lote ${conteo.numeroLote}`}
            {conteo.numeroSerie && `Serie ${conteo.numeroSerie}`}
            {(conteo.numeroLote ?? conteo.numeroSerie) && ' · '}
            Esperado {formatearCantidad(conteo.cantidadEsperada)} · Encontrado{' '}
            <span className={novedad ? 'font-semibold text-texto' : ''}>{formatearCantidad(conteo.cantidadEncontrada)}</span>
          </p>
        </div>
        <Insignia tono={TONO_ESTADO_CONTEO[conteo.estado]}>{ETIQUETAS_ESTADO_CONTEO[conteo.estado]}</Insignia>
      </div>
      {conteo.observaciones && <p className="mt-2 rounded-xl bg-white/80 px-3 py-2 text-[13px] text-texto">{conteo.observaciones}</p>}
      {propuestas.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {propuestas.map((propuesta) => {
            const Icono = ICONOS_ACCION[propuesta.accion];
            return (
              <button
                key={propuesta.accion}
                type="button"
                onClick={() => alElegir(propuesta)}
                className="campo-vidrio inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-texto hover:bg-white"
              >
                <Icono aria-hidden strokeWidth={1.75} className="size-3.5" />
                {propuesta.etiqueta}
              </button>
            );
          })}
        </div>
      )}
    </li>
  );
}

/** Conteos de una verificación. Las novedades se resuelven con ajustes, bajas o transferencias. */
export function PanelVerificacion({ resumen, alCerrar }: { resumen: VerificacionInventario; alCerrar: () => void }) {
  const consulta = useVerificacionInventario(resumen.id);
  const [propuesta, setPropuesta] = useState<PropuestaNovedad | null>(null);
  // Movimientos creados desde aquí, para proponerlos en la resolución.
  const [correcciones, setCorrecciones] = useState<Movimiento[]>([]);
  const verificacion = consulta.data ?? resumen;
  const pendiente = verificacion.pendienteDeRevision;
  const conteos = [...verificacion.conteos].sort((a, b) => Number(a.estado === 'conforme') - Number(b.estado === 'conforme'));

  return (
    <Dialogo
      abierto
      variante="lateral"
      titulo={`Verificación de ${verificacion.ubicacionNombre ?? 'inventario'}`}
      descripcion={
        <span className="flex flex-wrap items-center gap-2">
          <Insignia tono={TONO_ESTADO_VERIFICACION[verificacion.estado]}>{ETIQUETAS_ESTADO_VERIFICACION[verificacion.estado]}</Insignia>
          <span>
            {ETIQUETAS_TIPO_VERIFICACION[verificacion.tipo]} · {verificacion.responsableNombre ?? 'Paramédico'}
          </span>
        </span>
      }
      alCerrar={alCerrar}
    >
      <div className="space-y-4 px-6 py-5">
        <dl className="grid grid-cols-2 gap-3 text-[13px]">
          <div>
            <dt className="text-texto-secundario">Iniciada</dt>
            <dd className="mt-0.5 text-texto">{formatearFechaHora(verificacion.iniciadaEn)}</dd>
          </div>
          <div>
            <dt className="text-texto-secundario">Finalizada</dt>
            <dd className="mt-0.5 text-texto">{verificacion.finalizadaEn ? formatearFechaHora(verificacion.finalizadaEn) : 'En curso'}</dd>
          </div>
        </dl>
        {verificacion.observaciones && <p className="rounded-xl bg-white/60 px-4 py-3 text-[13px] text-texto">{verificacion.observaciones}</p>}
        {pendiente && (
          <p className="flex items-start gap-2 rounded-xl bg-primario/5 px-4 py-3 text-[13px] text-texto">
            <PackageMinus aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-primario" />
            La verificación no cambia existencias. Corrige cada novedad con un movimiento (ajuste, baja, devolución o
            reposición) y luego márcala como revisada.
          </p>
        )}
        {correcciones.length > 0 && (
          <p className="text-[13px] text-texto-secundario">
            Movimientos creados aquí: {correcciones.map((movimiento) => movimiento.codigo).join(', ')}.
          </p>
        )}

        {consulta.isError ? (
          <EstadoError titulo="No fue posible cargar los conteos" mensaje={consulta.error.message} alReintentar={() => void consulta.refetch()} />
        ) : (
          <>
            <p className="text-sm text-texto">
              <span className="font-semibold">{verificacion.totalNovedades}</span> {verificacion.totalNovedades === 1 ? 'novedad' : 'novedades'} de{' '}
              {verificacion.conteos.length} {verificacion.conteos.length === 1 ? 'conteo' : 'conteos'}
            </p>
            <ul className="space-y-2">
              {conteos.map((conteo) => (
                <FilaConteo key={conteo.id} conteo={conteo} verificacion={verificacion} conCorrecciones={pendiente} alElegir={setPropuesta} />
              ))}
            </ul>
            <RevisionVerificacion verificacion={verificacion} propuesta={proponerResolucion(correcciones)} alRevisar={alCerrar} />
          </>
        )}
      </div>
      {propuesta && (
        <PanelNuevoMovimiento
          titulo={TITULOS_ACCION[propuesta.accion]}
          inicial={propuesta.borrador}
          alRegistrar={(movimiento) => setCorrecciones((actuales) => [...actuales, movimiento])}
          alCerrar={() => setPropuesta(null)}
        />
      )}
    </Dialogo>
  );
}
