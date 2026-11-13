import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Ban, CircleCheck, LoaderCircle, MessageSquareText } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoTexto } from '../../../components/forms/campo_texto';
import { EstadoError } from '../../../components/states/estado_error';
import { Dialogo } from '../../../components/ui/dialogo';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { ETIQUETAS_ESTADO_EQUIPO, ETIQUETAS_TIPO_MOVIMIENTO } from '../constants/catalogos_inventario';
import { claseBotonPrimario, claseBotonSecundario } from '../constants/estilos_inventario';
import { useMovimiento } from '../hooks/use_consultas_inventario';
import { useMutacionInventario } from '../hooks/use_mutacion_inventario';
import { esquemaAnulacion, type FormularioAnulacion } from '../schemas/movimiento.schema';
import { anularMovimiento, confirmarMovimiento } from '../services/movimientos.service';
import type { Movimiento } from '../types/inventario.types';
import { formatearCantidad, formatearDia } from '../utils/formato_inventario';
import { InsigniaEstadoMovimiento, NombreUbicacion } from './insignias_movimiento';

function Anulacion({ movimiento, alTerminar, alCancelar }: { movimiento: Movimiento; alTerminar: () => void; alCancelar: () => void }) {
  const { notificar } = useNotificaciones();
  const mutacion = useMutacionInventario(({ motivo }: FormularioAnulacion) => anularMovimiento(movimiento.id, motivo));
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormularioAnulacion>({ resolver: zodResolver(esquemaAnulacion), defaultValues: { motivo: '' } });

  const enviar = (datos: FormularioAnulacion) =>
    mutacion.mutate(datos, {
      onSuccess: (anulado) => {
        notificar({ tono: 'exito', titulo: 'Movimiento anulado', descripcion: `${anulado.codigo} queda como constancia.` });
        alTerminar();
      },
    });

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-3 rounded-2xl border border-critico/20 bg-critico/4 p-4">
      {mutacion.error && <AlertaError error={mutacion.error} />}
      <CampoTexto
        id="motivo-anulacion"
        etiqueta="¿Por qué se anula?"
        icono={MessageSquareText}
        maxLength={150}
        autoFocus
        disabled={mutacion.isPending}
        ayuda={movimiento.tipo === 'devolucion' ? 'P. ej. no llegó o llegó en mal estado.' : undefined}
        error={errors.motivo?.message}
        {...register('motivo')}
      />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={alCancelar} disabled={mutacion.isPending} className={claseBotonSecundario}>
          Volver
        </button>
        <button
          type="submit"
          disabled={mutacion.isPending}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-critico px-4 text-sm font-semibold text-white shadow-critico hover:bg-critico-hover disabled:opacity-60"
        >
          {mutacion.isPending ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <Ban aria-hidden strokeWidth={1.75} className="size-4" />}
          Anular
        </button>
      </div>
    </form>
  );
}

interface PropiedadesPanelMovimiento {
  /** Lo que ya se conoce de la tabla, mientras llega el detalle. */
  resumen: Movimiento;
  alCerrar: () => void;
}

/** Detalle de un movimiento. Un borrador se confirma (aplica existencias) o se anula. */
export function PanelMovimiento({ resumen, alCerrar }: PropiedadesPanelMovimiento) {
  const { notificar } = useNotificaciones();
  const consulta = useMovimiento(resumen.id);
  const confirmacion = useMutacionInventario(() => confirmarMovimiento(resumen.id));
  const [anulando, setAnulando] = useState(false);
  const movimiento = consulta.data ?? resumen;
  const esBorrador = movimiento.estado === 'borrador';
  const esDevolucion = movimiento.tipo === 'devolucion';

  const confirmar = () =>
    confirmacion.mutate(undefined, {
      onSuccess: (confirmado) =>
        notificar({
          tono: 'exito',
          titulo: esDevolucion ? 'Devolución recibida' : 'Movimiento confirmado',
          descripcion: `${confirmado.codigo}: las existencias ya cambiaron.`,
        }),
    });

  return (
    <Dialogo
      abierto
      variante="lateral"
      titulo={`${ETIQUETAS_TIPO_MOVIMIENTO[movimiento.tipo]} ${movimiento.codigo}`}
      descripcion={
        <span className="flex flex-wrap items-center gap-2">
          <InsigniaEstadoMovimiento estado={movimiento.estado} />
          <span>
            {movimiento.usuarioNombre ?? 'Usuario'} · {formatearFechaHora(movimiento.realizadoEn)}
          </span>
        </span>
      }
      cerrable={!confirmacion.isPending}
      alCerrar={alCerrar}
    >
      <div className="space-y-5 px-6 py-5">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white/60 px-4 py-3 text-sm text-texto">
          <span className="min-w-0">
            <span className="block text-xs text-texto-secundario">Origen</span>
            <NombreUbicacion ubicacion={movimiento.origen} />
          </span>
          <ArrowRight aria-hidden strokeWidth={1.75} className="size-4 text-texto-secundario" />
          <span className="min-w-0">
            <span className="block text-xs text-texto-secundario">Destino</span>
            <NombreUbicacion ubicacion={movimiento.destino} />
          </span>
        </div>

        {(movimiento.motivo ?? movimiento.documentoReferencia ?? movimiento.observaciones) && (
          <dl className="space-y-2 text-[13px]">
            {movimiento.motivo && (
              <div>
                <dt className="text-texto-secundario">Motivo</dt>
                <dd className="text-texto">{movimiento.motivo}</dd>
              </div>
            )}
            {movimiento.documentoReferencia && (
              <div>
                <dt className="text-texto-secundario">Documento</dt>
                <dd className="text-texto">{movimiento.documentoReferencia}</dd>
              </div>
            )}
            {movimiento.observaciones && (
              <div>
                <dt className="text-texto-secundario">Observaciones</dt>
                <dd className="text-texto">{movimiento.observaciones}</dd>
              </div>
            )}
          </dl>
        )}

        {consulta.isError ? (
          <EstadoError titulo="No fue posible cargar el detalle" mensaje={consulta.error.message} alReintentar={() => void consulta.refetch()} />
        ) : (
          <div>
            <p className="mb-2 text-sm font-semibold text-texto">
              {movimiento.lineas.length} {movimiento.lineas.length === 1 ? 'línea' : 'líneas'}
            </p>
            <ul className="divide-y divide-borde/60 rounded-2xl border border-borde/70 bg-white/60">
              {movimiento.lineas.map((linea) => (
                <li key={linea.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-texto">{linea.insumoNombre}</p>
                    <p className="text-[13px] text-texto-secundario">
                      {linea.insumoCodigo}
                      {linea.numeroLote && ` · Lote ${linea.numeroLote}`}
                      {linea.loteVencimiento && ` (vence ${formatearDia(linea.loteVencimiento)})`}
                      {linea.numeroSerie && ` · Serie ${linea.numeroSerie}`}
                      {linea.equipoEstado && linea.equipoEstado !== 'operativo' && ` · ${ETIQUETAS_ESTADO_EQUIPO[linea.equipoEstado]}`}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-texto tabular-nums">
                    {formatearCantidad(linea.cantidad)} <span className="font-normal text-texto-secundario">{linea.unidadMedida}</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {esBorrador && (
          <div className="space-y-3">
            {confirmacion.error && <AlertaError error={confirmacion.error} />}
            {anulando ? (
              <Anulacion movimiento={movimiento} alTerminar={() => setAnulando(false)} alCancelar={() => setAnulando(false)} />
            ) : (
              <>
                <p className="text-[13px] text-texto-secundario">
                  {esDevolucion
                    ? 'Confírmala al recibir la mercancía en la bodega. Si no llegó o está mal, anúlala con un motivo.'
                    : 'Al confirmar se aplican las existencias y se revalida con la fecha de hoy: un lote pudo vencer o un equipo dañarse desde que se creó el borrador.'}
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  <button type="button" onClick={() => setAnulando(true)} disabled={confirmacion.isPending} className={`${claseBotonSecundario} text-critico!`}>
                    <Ban aria-hidden strokeWidth={1.75} className="size-4" />
                    Anular
                  </button>
                  <button type="button" onClick={confirmar} disabled={confirmacion.isPending} className={claseBotonPrimario}>
                    {confirmacion.isPending ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <CircleCheck aria-hidden strokeWidth={1.75} className="size-4" />}
                    {esDevolucion ? 'Confirmar recepción' : 'Confirmar'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        {movimiento.estado === 'confirmado' && (
          <p className="text-[13px] text-texto-secundario">Confirmado: ya no se edita ni se anula. Si hay un error, corrígelo con un ajuste.</p>
        )}
      </div>
    </Dialogo>
  );
}
