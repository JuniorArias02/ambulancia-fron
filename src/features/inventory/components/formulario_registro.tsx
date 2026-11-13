import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarCheck, CalendarX, CircleDot, FileBadge, Plus, Save, Tag, UserRound } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoSelector } from '../../../components/forms/campo_selector';
import { CampoTexto } from '../../../components/forms/campo_texto';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import {
  ESTADOS_REGISTRO,
  ETIQUETAS_ESTADO_REGISTRO,
  ETIQUETAS_TIPO_REGISTRO,
  TIPOS_REGISTRO,
} from '../constants/catalogos_inventario';
import { useCatalogoInsumos } from '../hooks/use_consultas_inventario';
import { useMutacionInventario } from '../hooks/use_mutacion_inventario';
import { esquemaRegistro, type EntradaRegistro, type FormularioRegistro as Datos } from '../schemas/catalogo.schema';
import { actualizarRegistro, crearRegistro } from '../services/catalogo.service';
import type { DatosRegistroSanitario, RegistroSanitario } from '../types/inventario.types';
import { soloCambios } from '../utils/cambios';
import { SelectorInsumo } from './selector_insumo';

interface PropiedadesFormularioRegistro {
  registro: RegistroSanitario | null;
  alCambiarSinGuardar: (sinGuardar: boolean) => void;
  alTerminar: () => void;
  alCancelar: () => void;
}

export function FormularioRegistro({ registro, alCambiarSinGuardar, alTerminar, alCancelar }: PropiedadesFormularioRegistro) {
  const { notificar } = useNotificaciones();
  const insumos = useCatalogoInsumos();
  const mutacion = useMutacionInventario((datos: DatosRegistroSanitario) => {
    if (!registro) return crearRegistro(datos);
    const { insumoId: _insumo, ...cambios } = soloCambios<DatosRegistroSanitario>(registro, datos);
    return actualizarRegistro(registro.id, cambios);
  });
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isDirty },
  } = useForm<EntradaRegistro, unknown, Datos>({
    resolver: zodResolver(esquemaRegistro),
    defaultValues: {
      insumoId: registro?.insumoId ?? '',
      numeroRegistro: registro?.numeroRegistro ?? '',
      tipoRegistro: registro?.tipoRegistro ?? 'registro_sanitario',
      fechaExpedicion: registro?.fechaExpedicion ?? '',
      fechaVencimiento: registro?.fechaVencimiento ?? '',
      titular: registro?.titular ?? '',
      documentoUrl: registro?.documentoUrl ?? '',
      estado: registro?.estado ?? 'vigente',
    },
  });

  useEffect(() => alCambiarSinGuardar(isDirty), [isDirty, alCambiarSinGuardar]);

  const enviar = (datos: Datos) =>
    mutacion.mutate(datos, {
      onSuccess: (guardado) => {
        notificar({ tono: 'exito', titulo: registro ? 'Registro actualizado' : 'Registro creado', descripcion: guardado.numeroRegistro });
        alTerminar();
      },
      onError: (error) => {
        if (error.estado === 409) setError('numeroRegistro', { message: error.message });
      },
    });

  const enviando = mutacion.isPending;
  // Solo los insumos que exigen registro, salvo el del registro que se edita.
  const opciones = insumos.data?.filter((insumo) => insumo.requiereRegistroSanitario || insumo.id === registro?.insumoId);

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="flex min-h-full flex-col">
      <fieldset disabled={enviando} className="flex-1 space-y-5 px-6 py-6">
        {mutacion.error && mutacion.error.estado !== 409 && <AlertaError error={mutacion.error} />}
        <Controller
          control={control}
          name="insumoId"
          render={({ field }) => (
            <SelectorInsumo
              id="insumoId"
              etiqueta="Insumo"
              insumos={opciones}
              cargando={insumos.isPending}
              valor={field.value}
              alCambiar={field.onChange}
              alSalir={field.onBlur}
              deshabilitado={registro !== null || !insumos.isSuccess}
              ayuda={registro ? 'El insumo de un registro no se cambia.' : 'Solo aparecen los insumos que exigen registro.'}
              error={errors.insumoId?.message}
            />
          )}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <CampoTexto id="numeroRegistro" etiqueta="Número" icono={FileBadge} placeholder="INVIMA 2020M-0012345" maxLength={100} error={errors.numeroRegistro?.message} {...register('numeroRegistro')} />
          <CampoSelector id="tipoRegistro" etiqueta="Tipo" icono={Tag} error={errors.tipoRegistro?.message} {...register('tipoRegistro')}>
            {TIPOS_REGISTRO.map((tipo) => (
              <option key={tipo} value={tipo}>
                {ETIQUETAS_TIPO_REGISTRO[tipo]}
              </option>
            ))}
          </CampoSelector>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <CampoTexto id="fechaExpedicion" etiqueta="Expedición" icono={CalendarCheck} type="date" obligatorio={false} error={errors.fechaExpedicion?.message} {...register('fechaExpedicion')} />
          <CampoTexto id="fechaVencimiento" etiqueta="Vencimiento" icono={CalendarX} type="date" obligatorio={false} error={errors.fechaVencimiento?.message} {...register('fechaVencimiento')} />
        </div>
        <CampoTexto id="titular" etiqueta="Titular" icono={UserRound} obligatorio={false} maxLength={150} error={errors.titular?.message} {...register('titular')} />
        <CampoSelector id="estado" etiqueta="Estado" icono={CircleDot} error={errors.estado?.message} {...register('estado')}>
          {ESTADOS_REGISTRO.map((estado) => (
            <option key={estado} value={estado}>
              {ETIQUETAS_ESTADO_REGISTRO[estado]}
            </option>
          ))}
        </CampoSelector>
      </fieldset>
      <PieFormulario
        textoEnviar={registro ? 'Guardar cambios' : 'Crear registro'}
        textoEnviando="Guardando…"
        icono={registro ? Save : Plus}
        enviando={enviando}
        deshabilitado={registro !== null && !isDirty}
        alCancelar={alCancelar}
      />
    </form>
  );
}
