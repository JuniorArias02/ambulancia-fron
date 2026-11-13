import { zodResolver } from '@hookform/resolvers/zod';
import { Barcode, Boxes, CalendarClock, CalendarPlus, NotebookPen, Plus, Save, Tags } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoTexto } from '../../../components/forms/campo_texto';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { useCatalogoInsumos } from '../hooks/use_consultas_inventario';
import { useMutacionInventario } from '../hooks/use_mutacion_inventario';
import { esquemaEquipo, type EntradaEquipo, type FormularioEquipo as Datos } from '../schemas/catalogo.schema';
import { actualizarEquipo, crearEquipo } from '../services/catalogo.service';
import type { DatosActualizarEquipo, Equipo } from '../types/inventario.types';
import { soloCambios } from '../utils/cambios';
import { SelectorInsumo } from './selector_insumo';
import { SelectorRegistro } from './selector_registro';

interface PropiedadesFormularioEquipo {
  equipo: Equipo | null;
  alCambiarSinGuardar: (sinGuardar: boolean) => void;
  alTerminar: () => void;
  alCancelar: () => void;
}

export function FormularioEquipo({ equipo, alCambiarSinGuardar, alTerminar, alCancelar }: PropiedadesFormularioEquipo) {
  const { notificar } = useNotificaciones();
  const insumos = useCatalogoInsumos();
  const porSerie = useMemo(() => insumos.data?.filter((insumo) => insumo.control === 'serie'), [insumos.data]);
  const reglas = useMemo(() => {
    const mapa = new Map((porSerie ?? []).map((insumo) => [insumo.id, insumo]));
    return (insumoId: string) => {
      const insumo = mapa.get(insumoId);
      return insumo && { exigeVencimiento: false, exigeRegistro: insumo.requiereRegistroSanitario };
    };
  }, [porSerie]);

  const mutacion = useMutacionInventario((datos: Datos) => {
    const { insumoId, registroSanitarioId, numeroSerie, ...corregibles } = datos;
    if (equipo) return actualizarEquipo(equipo.id, soloCambios<DatosActualizarEquipo>(equipo, corregibles));
    return crearEquipo({ insumoId, registroSanitarioId, numeroSerie, ...corregibles });
  });

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isDirty },
  } = useForm<EntradaEquipo, unknown, Datos>({
    resolver: zodResolver(esquemaEquipo(equipo === null, reglas)),
    defaultValues: {
      insumoId: equipo?.insumoId ?? '',
      registroSanitarioId: equipo?.registroSanitarioId ?? '',
      numeroSerie: equipo?.numeroSerie ?? '',
      marca: equipo?.marca ?? '',
      modelo: equipo?.modelo ?? '',
      fechaAdquisicion: equipo?.fechaAdquisicion ?? '',
      fechaProximoMantenimiento: equipo?.fechaProximoMantenimiento ?? '',
      observaciones: equipo?.observaciones ?? '',
    },
  });
  const insumoId = useWatch({ control, name: 'insumoId' });

  useEffect(() => alCambiarSinGuardar(isDirty), [isDirty, alCambiarSinGuardar]);

  const enviar = (datos: Datos) =>
    mutacion.mutate(datos, {
      onSuccess: (guardado) => {
        notificar({ tono: 'exito', titulo: equipo ? 'Equipo actualizado' : 'Equipo registrado', descripcion: guardado.numeroSerie });
        alTerminar();
      },
      onError: (error) => {
        if (error.estado === 409) setError('numeroSerie', { message: error.message });
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
                insumos={porSerie}
                cargando={insumos.isPending}
                valor={field.value}
                alCambiar={field.onChange}
                alSalir={field.onBlur}
                deshabilitado={equipo !== null || !insumos.isSuccess}
                ayuda={equipo ? 'El insumo y la serie de un equipo no se cambian.' : 'Solo los insumos controlados por serie.'}
                error={errors.insumoId?.message}
              />
            )}
          />
          <CampoTexto id="numeroSerie" etiqueta="Número de serie" icono={Barcode} maxLength={100} disabled={equipo !== null} error={errors.numeroSerie?.message} {...register('numeroSerie')} />
          {!equipo && (
            <Controller
              control={control}
              name="registroSanitarioId"
              render={({ field }) => (
                <SelectorRegistro
                  id="registroSanitarioId"
                  insumoId={insumoId}
                  obligatorioPorInsumo={reglas(insumoId)?.exigeRegistro ?? false}
                  valor={field.value}
                  alCambiar={field.onChange}
                  alSalir={field.onBlur}
                  error={errors.registroSanitarioId?.message}
                />
              )}
            />
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            <CampoTexto id="marca" etiqueta="Marca" icono={Tags} obligatorio={false} maxLength={100} error={errors.marca?.message} {...register('marca')} />
            <CampoTexto id="modelo" etiqueta="Modelo" icono={Boxes} obligatorio={false} maxLength={100} error={errors.modelo?.message} {...register('modelo')} />
          </div>
        </fieldset>
        <fieldset disabled={enviando} className="space-y-5">
          <legend className="mb-4 text-sm font-semibold text-texto">Fechas</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <CampoTexto id="fechaAdquisicion" etiqueta="Adquisición" icono={CalendarPlus} type="date" obligatorio={false} error={errors.fechaAdquisicion?.message} {...register('fechaAdquisicion')} />
            <CampoTexto id="fechaProximoMantenimiento" etiqueta="Próximo mantenimiento" icono={CalendarClock} type="date" obligatorio={false} error={errors.fechaProximoMantenimiento?.message} {...register('fechaProximoMantenimiento')} />
          </div>
          <CampoTexto id="observaciones" etiqueta="Observaciones" icono={NotebookPen} obligatorio={false} maxLength={5000} error={errors.observaciones?.message} {...register('observaciones')} />
        </fieldset>
      </div>
      <PieFormulario
        textoEnviar={equipo ? 'Guardar cambios' : 'Registrar equipo'}
        textoEnviando="Guardando…"
        icono={equipo ? Save : Plus}
        enviando={enviando}
        deshabilitado={equipo !== null && !isDirty}
        alCancelar={alCancelar}
      />
    </form>
  );
}
