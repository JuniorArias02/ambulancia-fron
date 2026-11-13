import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle, Plus } from 'lucide-react';
import { useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { SelectorBuscable } from '../../../components/forms/selector_buscable';
import { Interruptor } from '../../../components/ui/interruptor';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { claseEntradaCompacta } from '../constants/estilos_inventario';
import { useMutacionInventario } from '../hooks/use_mutacion_inventario';
import { esquemaNuevoDetalle, type EntradaNuevoDetalle, type FormularioNuevoDetalle } from '../schemas/perfil.schema';
import { agregarDetallePerfil } from '../services/perfiles.service';
import type { Insumo, PerfilDotacion } from '../types/inventario.types';
import { opcionesInsumos } from '../utils/opciones_inventario';

interface PropiedadesFormularioNuevoDetalle {
  perfil: PerfilDotacion;
  insumos: readonly Insumo[] | undefined;
}

const VACIO: EntradaNuevoDetalle = { insumoId: '', cantidadRequerida: '', cantidadMinima: '', obligatorio: true, observaciones: '' };

/** Agrega un insumo al perfil. Los que ya están no se ofrecen. */
export function FormularioNuevoDetalle({ perfil, insumos }: PropiedadesFormularioNuevoDetalle) {
  const { notificar } = useNotificaciones();
  const yaIncluidos = new Set(perfil.detalles.map((detalle) => detalle.insumoId));
  const disponibles = (insumos ?? []).filter((insumo) => !yaIncluidos.has(insumo.id));
  const controlDe = useMemo(() => {
    const mapa = new Map((insumos ?? []).map((insumo) => [insumo.id, insumo.control]));
    return (insumoId: string) => mapa.get(insumoId);
  }, [insumos]);

  const mutacion = useMutacionInventario((datos: FormularioNuevoDetalle) => agregarDetallePerfil(perfil.id, datos));
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EntradaNuevoDetalle, unknown, FormularioNuevoDetalle>({ resolver: zodResolver(esquemaNuevoDetalle(controlDe)), defaultValues: VACIO });
  const insumoId = useWatch({ control, name: 'insumoId' });
  const unidad = insumos?.find((insumo) => insumo.id === insumoId)?.unidadMedida;

  const enviar = (datos: FormularioNuevoDetalle) =>
    mutacion.mutate(datos, {
      onSuccess: () => {
        notificar({ tono: 'exito', titulo: 'Elemento agregado' });
        reset(VACIO);
      },
    });

  const error = errors.insumoId?.message ?? errors.cantidadRequerida?.message ?? errors.cantidadMinima?.message;

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-3 border-t border-borde/70 px-5 py-4">
      <p className="text-sm font-semibold text-texto">Agregar elemento</p>
      {mutacion.error && <AlertaError error={mutacion.error} />}
      <fieldset disabled={mutacion.isPending} className="grid gap-2 md:grid-cols-[minmax(0,1fr)_8rem_8rem_auto_auto] md:items-center">
        <div className="relative">
          <Controller
            control={control}
            name="insumoId"
            render={({ field }) => (
              <SelectorBuscable
                etiqueta="Insumo"
                opciones={opcionesInsumos(disponibles)}
                valor={field.value}
                alCambiar={field.onChange}
                alSalir={field.onBlur}
                placeholder={insumos ? 'Busca el insumo' : 'Cargando insumos…'}
                textoSinResultados="Ningún insumo coincide o ya está en el perfil"
                deshabilitado={!insumos}
                invalido={Boolean(errors.insumoId)}
                claseEntrada={claseEntradaCompacta}
              />
            )}
          />
        </div>
        <input aria-label={`Cantidad requerida${unidad ? ` en ${unidad}` : ''}`} placeholder="Requerida" inputMode="decimal" aria-invalid={errors.cantidadRequerida ? true : undefined} className={`${claseEntradaCompacta} tabular-nums`} {...register('cantidadRequerida')} />
        <input aria-label="Cantidad mínima" placeholder="Mínima" inputMode="decimal" aria-invalid={errors.cantidadMinima ? true : undefined} className={`${claseEntradaCompacta} tabular-nums`} {...register('cantidadMinima')} />
        <Controller control={control} name="obligatorio" render={({ field }) => <Interruptor etiqueta="Obligatorio" activo={field.value} alCambiar={field.onChange} />} />
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primario/8 px-3 text-sm font-semibold text-primario hover:bg-primario/12 disabled:opacity-50"
        >
          {mutacion.isPending ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <Plus aria-hidden strokeWidth={1.75} className="size-4" />}
          Agregar
        </button>
      </fieldset>
      {error ? (
        <p className="text-[13px] text-critico">{error}</p>
      ) : (
        <p className="text-[13px] text-texto-secundario">
          La mínima es el umbral crítico; vacía, igual a la requerida.{unidad ? ` Unidad: ${unidad}.` : ''}
        </p>
      )}
    </form>
  );
}
