import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, CalendarClock, CircleCheck, FileText, Info, LoaderCircle, MapPin, MessageSquareText, NotebookPen, Plus, Save, Tag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoBuscable } from '../../../components/forms/campo_buscable';
import { CampoSelector } from '../../../components/forms/campo_selector';
import { CampoTexto } from '../../../components/forms/campo_texto';
import { EstadoError } from '../../../components/states/estado_error';
import { SelectorSegmentado } from '../../../components/ui/selector_segmentado';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import {
  DESCRIPCIONES_TIPO_MOVIMIENTO,
  ETIQUETAS_TIPO_MOVIMIENTO,
  MAXIMO_LINEAS,
  TIPOS_MOVIMIENTO,
} from '../constants/catalogos_inventario';
import { claseBotonPrimario, claseBotonSecundario } from '../constants/estilos_inventario';
import { useCatalogoInsumos, useExistenciasDeUbicacion, useUbicaciones } from '../hooks/use_consultas_inventario';
import { useMutacionInventario } from '../hooks/use_mutacion_inventario';
import {
  esquemaMovimiento,
  type BorradorMovimiento,
  type EntradaMovimiento,
  type FormularioMovimiento as Datos,
} from '../schemas/movimiento.schema';
import { registrarMovimiento } from '../services/movimientos.service';
import type { DatosMovimiento, Insumo, Movimiento, UbicacionInventario } from '../types/inventario.types';
import { opcionesUbicaciones } from '../utils/opciones_inventario';
import { reglaMovimiento, type ReglaMovimiento, type SentidoAjuste } from '../utils/reglas_movimiento';
import { LineaDesdeOrigen, LineaSinOrigen, type ValorLinea } from './lineas_movimiento';

const ahora = () => new Date();

const LINEA_VACIA = { insumoId: '', loteId: '', equipoId: '', cantidad: '' };

const OPCIONES_SENTIDO = [
  { valor: 'aumentar', texto: 'Aumenta', icono: ArrowUp },
  { valor: 'disminuir', texto: 'Disminuye', icono: ArrowDown },
] as const;

function aDatos(datos: Datos, confirmar: boolean): DatosMovimiento {
  const regla = reglaMovimiento(datos.tipo, datos.sentidoAjuste);
  return {
    tipo: datos.tipo,
    origenUbicacionId: regla.origen ? datos.origenUbicacionId : null,
    destinoUbicacionId: regla.destino ? datos.destinoUbicacionId : null,
    motivo: datos.motivo,
    documentoReferencia: datos.documentoReferencia,
    observaciones: datos.observaciones,
    ...(datos.realizadoEn ? { realizadoEn: new Date(datos.realizadoEn).toISOString() } : {}),
    confirmar,
    lineas: datos.lineas.map(({ insumoId, loteId, equipoId, cantidad }) => ({
      insumoId,
      ...(loteId ? { loteId } : {}),
      ...(equipoId ? { equipoId } : {}),
      cantidad,
    })),
  };
}

/** `AAAA-MM-DDTHH:mm` local, para el máximo de un `datetime-local`. */
function ahoraLocal(): string {
  const ahora = new Date();
  return new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

interface PropiedadesFormularioMovimiento {
  inicial?: BorradorMovimiento;
  alCambiarSinGuardar: (sinGuardar: boolean) => void;
  /** Recibe el movimiento registrado (p. ej. para citarlo al revisar una verificación). */
  alTerminar: (movimiento: Movimiento) => void;
  alCancelar: () => void;
}

/**
 * Espera el catálogo y las ubicaciones antes de montar el formulario: así los selectores
 * muestran desde el inicio el origen y el destino que proponga otra pantalla.
 */
export function FormularioMovimiento(propiedades: PropiedadesFormularioMovimiento) {
  const insumos = useCatalogoInsumos();
  const ubicaciones = useUbicaciones();

  if (insumos.isPending || ubicaciones.isPending) {
    return (
      <div role="status" aria-label="Cargando formulario" className="space-y-3 px-6 py-6">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-xl bg-white/50" />
        ))}
      </div>
    );
  }
  if (insumos.isError || ubicaciones.isError) {
    const error = insumos.error ?? ubicaciones.error;
    return (
      <EstadoError
        titulo="No fue posible preparar el movimiento"
        mensaje={error?.message ?? 'Inténtalo de nuevo.'}
        alReintentar={() => {
          void insumos.refetch();
          void ubicaciones.refetch();
        }}
      />
    );
  }
  return <FormularioMovimientoCargado {...propiedades} insumos={insumos.data} ubicaciones={ubicaciones.data} />;
}

function FormularioMovimientoCargado({
  inicial,
  alCambiarSinGuardar,
  alTerminar,
  alCancelar,
  insumos: catalogo,
  ubicaciones: todas,
}: PropiedadesFormularioMovimiento & { insumos: Insumo[]; ubicaciones: UbicacionInventario[] }) {
  const { notificar } = useNotificaciones();
  // Solo indica en qué botón se muestra la carga.
  const [confirmando, setConfirmando] = useState(false);
  const [maximo] = useState(ahoraLocal);

  const controlDe = useMemo(() => {
    const mapa = new Map(catalogo.map((insumo) => [insumo.id, insumo.control]));
    return (insumoId: string) => mapa.get(insumoId);
  }, [catalogo]);

  const mutacion = useMutacionInventario((datos: DatosMovimiento) => registrarMovimiento(datos));
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isDirty, isSubmitted },
  } = useForm<EntradaMovimiento, unknown, Datos>({
    resolver: zodResolver(esquemaMovimiento(controlDe, ahora)),
    defaultValues: {
      tipo: inicial?.tipo ?? 'entrada',
      sentidoAjuste: inicial?.sentidoAjuste ?? 'disminuir',
      origenUbicacionId: inicial?.origenUbicacionId ?? '',
      destinoUbicacionId: inicial?.destinoUbicacionId ?? '',
      motivo: inicial?.motivo ?? '',
      documentoReferencia: '',
      observaciones: '',
      realizadoEn: '',
      lineas: inicial?.lineas?.length
        ? inicial.lineas.map((linea) => ({
            insumoId: linea.insumoId,
            loteId: linea.loteId ?? '',
            equipoId: linea.equipoId ?? '',
            cantidad: String(linea.cantidad),
          }))
        : [LINEA_VACIA],
    },
  });
  const lineas = useFieldArray({ control, name: 'lineas' });
  const tipo = useWatch({ control, name: 'tipo' });
  const sentido = useWatch({ control, name: 'sentidoAjuste' });
  const origenId = useWatch({ control, name: 'origenUbicacionId' });
  const destinoId = useWatch({ control, name: 'destinoUbicacionId' });
  const valoresLineas = useWatch({ control, name: 'lineas' });

  const regla = reglaMovimiento(tipo, sentido);
  const activas = todas.filter((ubicacion) => ubicacion.activa);
  const opcionesOrigen = regla.origen ? activas.filter((ubicacion) => regla.origen?.includes(ubicacion.tipo)) : [];
  const opcionesDestino = regla.destino ? activas.filter((ubicacion) => regla.destino?.includes(ubicacion.tipo)) : [];
  const destino = activas.find((ubicacion) => ubicacion.id === destinoId);
  const existencias = useExistenciasDeUbicacion(regla.origen ? origenId || undefined : undefined);

  useEffect(() => alCambiarSinGuardar(isDirty), [isDirty, alCambiarSinGuardar]);

  // Al cambiar de tipo, se quitan el origen o el destino que dejan de aplicar.
  useEffect(() => {
    const vigente = reglaMovimiento(tipo, sentido);
    const valida = (id: string, tipos: ReglaMovimiento['origen']) =>
      !id || (tipos !== null && todas.some((ubicacion) => ubicacion.id === id && tipos.includes(ubicacion.tipo)));
    if (!valida(origenId, vigente.origen)) setValue('origenUbicacionId', '');
    if (!valida(destinoId, vigente.destino)) setValue('destinoUbicacionId', '');
  }, [tipo, sentido, origenId, destinoId, todas, setValue]);

  const cambiarLinea = (indice: number, valor: ValorLinea) => {
    const opciones = { shouldDirty: true, shouldValidate: isSubmitted };
    setValue(`lineas.${indice}.insumoId`, valor.insumoId, opciones);
    setValue(`lineas.${indice}.loteId`, valor.loteId, opciones);
    setValue(`lineas.${indice}.equipoId`, valor.equipoId, opciones);
    // Los equipos se mueven de a 1.
    if (valor.equipoId) setValue(`lineas.${indice}.cantidad`, '1', opciones);
  };

  const enviar = (datos: Datos, confirmar: boolean) => {
    setConfirmando(confirmar);
    mutacion.mutate(aDatos(datos, confirmar), {
      onSuccess: (movimiento) => {
        notificar({
          tono: 'exito',
          titulo: confirmar ? 'Movimiento confirmado' : 'Borrador guardado',
          descripcion: confirmar ? `${movimiento.codigo}: las existencias ya cambiaron.` : `${movimiento.codigo}: confírmalo para aplicar las existencias.`,
        });
        alTerminar(movimiento);
      },
    });
  };

  const enviando = mutacion.isPending;
  const desdeOrigen = regla.origen !== null;
  const bloquearNoUtilizables = tipo === 'consumo' || destino?.tipo === 'ambulancia';
  const nombreInsumo = (insumoId: string) => catalogo.find((insumo) => insumo.id === insumoId)?.nombre;

  return (
    <form onSubmit={handleSubmit((datos) => enviar(datos, false))} noValidate className="flex min-h-full flex-col">
      <div className="flex-1 space-y-7 px-6 py-6">
        {mutacion.error && <AlertaError error={mutacion.error} />}

        <fieldset disabled={enviando} className="space-y-4">
          <legend className="mb-3 text-sm font-semibold text-texto">Tipo y ubicaciones</legend>
          <CampoSelector id="tipo-movimiento" etiqueta="Tipo de movimiento" icono={Tag} ayuda={DESCRIPCIONES_TIPO_MOVIMIENTO[tipo]} {...register('tipo')}>
            {TIPOS_MOVIMIENTO.map((opcion) => (
              <option key={opcion} value={opcion}>
                {ETIQUETAS_TIPO_MOVIMIENTO[opcion]}
              </option>
            ))}
          </CampoSelector>
          {tipo === 'ajuste' && (
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-texto">La existencia…</p>
              <SelectorSegmentado<SentidoAjuste>
                etiqueta="Sentido del ajuste"
                valor={sentido}
                opciones={OPCIONES_SENTIDO}
                alCambiar={(valor) => setValue('sentidoAjuste', valor, { shouldDirty: true })}
              />
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {regla.origen && (
              <Controller
                control={control}
                name="origenUbicacionId"
                render={({ field }) => (
                  <CampoBuscable
                    id="origen"
                    etiqueta="Origen"
                    icono={MapPin}
                    opciones={opcionesUbicaciones(opcionesOrigen)}
                    valor={field.value}
                    alCambiar={field.onChange}
                    alSalir={field.onBlur}
                    placeholder="Busca la bodega o ambulancia"
                    textoSinResultados="Ninguna ubicación coincide"
                    error={errors.origenUbicacionId?.message}
                  />
                )}
              />
            )}
            {regla.destino && (
              <Controller
                control={control}
                name="destinoUbicacionId"
                render={({ field }) => (
                  <CampoBuscable
                    id="destino"
                    etiqueta="Destino"
                    icono={MapPin}
                    opciones={opcionesUbicaciones(opcionesDestino).map((opcion) => ({ ...opcion, deshabilitada: opcion.valor === origenId }))}
                    valor={field.value}
                    alCambiar={field.onChange}
                    alSalir={field.onBlur}
                    placeholder="Busca la bodega o ambulancia"
                    textoSinResultados="Ninguna ubicación coincide"
                    error={errors.destinoUbicacionId?.message}
                  />
                )}
              />
            )}
          </div>
        </fieldset>

        <fieldset disabled={enviando} className="space-y-3">
          <legend className="mb-1 text-sm font-semibold text-texto">Líneas</legend>
          {desdeOrigen && !origenId ? (
            <p className="rounded-xl bg-white/60 px-4 py-3 text-[13px] text-texto-secundario">
              Elige primero el origen para ver lo que hay disponible.
            </p>
          ) : (
            <>
              {bloquearNoUtilizables && (
                <p className="flex items-start gap-2 text-[13px] text-texto-secundario">
                  <Info aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0" />
                  Los lotes vencidos y los equipos no operativos no pueden ir a una ambulancia ni consumirse.
                </p>
              )}
              <ol className="space-y-2">
                {lineas.fields.map((campo, indice) => {
                  const valor = valoresLineas[indice] ?? LINEA_VACIA;
                  const comunes = {
                    indice,
                    valor,
                    errores: {
                      insumoId: errors.lineas?.[indice]?.insumoId?.message,
                      loteId: errors.lineas?.[indice]?.loteId?.message,
                      equipoId: errors.lineas?.[indice]?.equipoId?.message,
                      cantidad: errors.lineas?.[indice]?.cantidad?.message,
                    },
                    registroCantidad: register(`lineas.${indice}.cantidad`),
                    deshabilitada: enviando,
                    puedeQuitar: lineas.fields.length > 1,
                    alCambiar: (nuevo: ValorLinea) => cambiarLinea(indice, nuevo),
                    alQuitar: () => lineas.remove(indice),
                  };
                  return desdeOrigen ? (
                    <LineaDesdeOrigen
                      key={campo.id}
                      {...comunes}
                      existencias={existencias.data}
                      cargando={existencias.isPending}
                      nombreInsumo={valor.insumoId ? nombreInsumo(valor.insumoId) : undefined}
                      bloquearNoUtilizables={bloquearNoUtilizables}
                    />
                  ) : (
                    <LineaSinOrigen key={campo.id} {...comunes} insumos={catalogo} soloEquiposOperativos={destino?.tipo === 'ambulancia'} />
                  );
                })}
              </ol>
              {errors.lineas?.root?.message && <p className="text-[13px] text-critico">{errors.lineas.root.message}</p>}
              <button
                type="button"
                onClick={() => lineas.append(LINEA_VACIA)}
                disabled={lineas.fields.length >= MAXIMO_LINEAS}
                className="inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-medium text-primario transition-colors duration-150 hover:bg-primario/6 disabled:opacity-50"
              >
                <Plus aria-hidden strokeWidth={1.75} className="size-4" />
                Agregar línea
              </button>
            </>
          )}
        </fieldset>

        <fieldset disabled={enviando} className="space-y-4">
          <legend className="mb-3 text-sm font-semibold text-texto">Soporte</legend>
          <CampoTexto
            id="motivo-movimiento"
            etiqueta="Motivo"
            icono={MessageSquareText}
            obligatorio={regla.motivoObligatorio}
            maxLength={150}
            placeholder={tipo === 'baja' ? 'Vencido, dañado…' : undefined}
            error={errors.motivo?.message}
            {...register('motivo')}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoTexto id="documento-movimiento" etiqueta="Documento de referencia" icono={FileText} obligatorio={false} placeholder="Remisión 0045" maxLength={150} error={errors.documentoReferencia?.message} {...register('documentoReferencia')} />
            <CampoTexto
              id="realizado-en"
              etiqueta="Realizado"
              icono={CalendarClock}
              type="datetime-local"
              obligatorio={false}
              max={maximo}
              ayuda="Vacío: ahora."
              error={errors.realizadoEn?.message}
              {...register('realizadoEn')}
            />
          </div>
          <CampoTexto id="observaciones-movimiento" etiqueta="Observaciones" icono={NotebookPen} obligatorio={false} maxLength={5000} error={errors.observaciones?.message} {...register('observaciones')} />
        </fieldset>

        <p className="rounded-xl bg-primario/5 px-4 py-3 text-[13px] text-texto">
          <span className="font-medium">Confirmar aplica las existencias de inmediato.</span> Un movimiento confirmado no se
          edita ni se anula: se corrige con un ajuste. Si no alcanza alguna existencia, no se aplica nada.
        </p>
      </div>

      <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-borde/70 bg-white/80 px-6 py-4 backdrop-blur-md">
        <button type="button" onClick={alCancelar} disabled={enviando} className={claseBotonSecundario}>
          Cancelar
        </button>
        <button type="submit" disabled={enviando} className={claseBotonSecundario}>
          {enviando && !confirmando ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <Save aria-hidden strokeWidth={1.75} className="size-4" />}
          Guardar borrador
        </button>
        <button type="button" onClick={handleSubmit((datos) => enviar(datos, true))} disabled={enviando} className={claseBotonPrimario}>
          {enviando && confirmando ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <CircleCheck aria-hidden strokeWidth={1.75} className="size-4" />}
          Registrar y confirmar
        </button>
      </div>
    </form>
  );
}
