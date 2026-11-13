import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarCheck, CalendarX, Factory, FileText, Hash, NotebookPen, Plus, Save, Truck } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoTexto } from '../../../components/forms/campo_texto';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { useCatalogoInsumos } from '../hooks/use_consultas_inventario';
import { useMutacionInventario } from '../hooks/use_mutacion_inventario';
import { esquemaLote, type EntradaLote, type FormularioLote as Datos } from '../schemas/catalogo.schema';
import { actualizarLote, crearLote } from '../services/catalogo.service';
import type { DatosActualizarLote, Lote } from '../types/inventario.types';
import { soloCambios } from '../utils/cambios';
import { SelectorInsumo } from './selector_insumo';
import { SelectorRegistro } from './selector_registro';

interface PropiedadesFormularioLote {
  lote: Lote | null;
  alCambiarSinGuardar: (sinGuardar: boolean) => void;
  alTerminar: () => void;
  alCancelar: () => void;
}

export function FormularioLote({ lote, alCambiarSinGuardar, alTerminar, alCancelar }: PropiedadesFormularioLote) {
  const { notificar } = useNotificaciones();
  const insumos = useCatalogoInsumos();
  const porLote = useMemo(() => insumos.data?.filter((insumo) => insumo.control === 'lote'), [insumos.data]);
  const reglas = useMemo(() => {
    const mapa = new Map((porLote ?? []).map((insumo) => [insumo.id, insumo]));
    return (insumoId: string) => {
      const insumo = mapa.get(insumoId);
      return insumo && { exigeVencimiento: insumo.requiereVencimiento, exigeRegistro: insumo.requiereRegistroSanitario };
    };
  }, [porLote]);

  const mutacion = useMutacionInventario((datos: Datos) => {
    const { insumoId, registroSanitarioId, numeroLote, ...corregibles } = datos;
    if (lote) return actualizarLote(lote.id, soloCambios<DatosActualizarLote>(lote, corregibles));
    // El backend registra la recepción ahora si no se indica.
    return crearLote({ insumoId, registroSanitarioId, numeroLote, recibidoEn: null, ...corregibles });
  });

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isDirty },
  } = useForm<EntradaLote, unknown, Datos>({
    resolver: zodResolver(esquemaLote(lote === null, reglas)),
    defaultValues: {
      insumoId: lote?.insumoId ?? '',
      registroSanitarioId: lote?.registroSanitarioId ?? '',
      numeroLote: lote?.numeroLote ?? '',
      fechaFabricacion: lote?.fechaFabricacion ?? '',
      fechaVencimiento: lote?.fechaVencimiento ?? '',
      fabricante: lote?.fabricante ?? '',
      proveedor: lote?.proveedor ?? '',
      documentoSoporte: lote?.documentoSoporte ?? '',
      observaciones: lote?.observaciones ?? '',
    },
  });
  const insumoId = useWatch({ control, name: 'insumoId' });
  const exigencias = reglas(insumoId);

  useEffect(() => alCambiarSinGuardar(isDirty), [isDirty, alCambiarSinGuardar]);

  const enviar = (datos: Datos) =>
    mutacion.mutate(datos, {
      onSuccess: (guardado) => {
        notificar({
          tono: 'exito',
          titulo: lote ? 'Lote actualizado' : 'Lote creado',
          descripcion: lote ? guardado.numeroLote : `${guardado.numeroLote}: registra una entrada para sumar existencias.`,
        });
        alTerminar();
      },
      onError: (error) => {
        if (error.estado === 409) setError('numeroLote', { message: error.message });
      },
    });

  const enviando = mutacion.isPending;

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="flex min-h-full flex-col">
      <div className="flex-1 space-y-8 px-6 py-6">
        {mutacion.error && mutacion.error.estado !== 409 && <AlertaError error={mutacion.error} />}
        <fieldset disabled={enviando} className="space-y-5">
          <legend className="mb-4 text-sm font-semibold text-texto">Identificación</legend>
          <Controller
            control={control}
            name="insumoId"
            render={({ field }) => (
              <SelectorInsumo
                id="insumoId"
                etiqueta="Insumo"
                insumos={porLote}
                cargando={insumos.isPending}
                valor={field.value}
                alCambiar={field.onChange}
                alSalir={field.onBlur}
                deshabilitado={lote !== null || !insumos.isSuccess}
                ayuda={lote ? 'El insumo y el número de un lote no se cambian.' : 'Solo los insumos controlados por lote.'}
                error={errors.insumoId?.message}
              />
            )}
          />
          <CampoTexto id="numeroLote" etiqueta="Número de lote" icono={Hash} placeholder="L2026-0457" maxLength={100} disabled={lote !== null} error={errors.numeroLote?.message} {...register('numeroLote')} />
          {!lote && (
            <Controller
              control={control}
              name="registroSanitarioId"
              render={({ field }) => (
                <SelectorRegistro
                  id="registroSanitarioId"
                  insumoId={insumoId}
                  obligatorioPorInsumo={exigencias?.exigeRegistro ?? false}
                  valor={field.value}
                  alCambiar={field.onChange}
                  alSalir={field.onBlur}
                  error={errors.registroSanitarioId?.message}
                />
              )}
            />
          )}
        </fieldset>

        <fieldset disabled={enviando} className="space-y-5">
          <legend className="mb-4 text-sm font-semibold text-texto">Fechas</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <CampoTexto id="fechaFabricacion" etiqueta="Fabricación" icono={CalendarCheck} type="date" obligatorio={false} error={errors.fechaFabricacion?.message} {...register('fechaFabricacion')} />
            <CampoTexto
              id="fechaVencimiento"
              etiqueta="Vencimiento"
              icono={CalendarX}
              type="date"
              obligatorio={exigencias?.exigeVencimiento ?? false}
              ayuda={lote ? 'El cambio de vencimiento queda auditado.' : undefined}
              error={errors.fechaVencimiento?.message}
              {...register('fechaVencimiento')}
            />
          </div>
        </fieldset>

        <fieldset disabled={enviando} className="space-y-5">
          <legend className="mb-4 text-sm font-semibold text-texto">Origen y soporte</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <CampoTexto id="fabricante" etiqueta="Fabricante" icono={Factory} obligatorio={false} maxLength={150} error={errors.fabricante?.message} {...register('fabricante')} />
            <CampoTexto id="proveedor" etiqueta="Proveedor" icono={Truck} obligatorio={false} maxLength={150} error={errors.proveedor?.message} {...register('proveedor')} />
          </div>
          <CampoTexto id="documentoSoporte" etiqueta="Documento soporte" icono={FileText} obligatorio={false} placeholder="FV-1234" maxLength={500} error={errors.documentoSoporte?.message} {...register('documentoSoporte')} />
          <CampoTexto id="observaciones" etiqueta="Observaciones" icono={NotebookPen} obligatorio={false} maxLength={5000} error={errors.observaciones?.message} {...register('observaciones')} />
        </fieldset>

        {!lote && (
          <p className="rounded-xl bg-primario/5 px-4 py-3 text-[13px] text-texto">
            Crear el lote no suma existencias: después registra una <span className="font-medium">entrada</span> a la bodega.
          </p>
        )}
      </div>
      <PieFormulario
        textoEnviar={lote ? 'Guardar cambios' : 'Crear lote'}
        textoEnviando="Guardando…"
        icono={lote ? Save : Plus}
        enviando={enviando}
        deshabilitado={lote !== null && !isDirty}
        alCancelar={alCancelar}
      />
    </form>
  );
}
