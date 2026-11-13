import { zodResolver } from '@hookform/resolvers/zod';
import { Factory, FolderTree, Gauge, Hash, Package, Plus, Ruler, Save, Tag, Text, Tags } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoSelector } from '../../../components/forms/campo_selector';
import { CampoTexto } from '../../../components/forms/campo_texto';
import { PieFormulario } from '../../../components/forms/pie_formulario';
import { Interruptor } from '../../../components/ui/interruptor';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { CONTROLES_INSUMO, ETIQUETAS_CONTROL, ETIQUETAS_TIPO_INSUMO, TIPOS_INSUMO } from '../constants/catalogos_inventario';
import { useMutacionInventario } from '../hooks/use_mutacion_inventario';
import { esquemaInsumo, type EntradaInsumo, type FormularioInsumo as Datos } from '../schemas/catalogo.schema';
import { actualizarInsumo, crearInsumo } from '../services/catalogo.service';
import type { DatosInsumo, Insumo } from '../types/inventario.types';
import { soloCambios } from '../utils/cambios';
import { OpcionesRadio } from './opciones_radio';

interface PropiedadesFormularioInsumo {
  insumo: Insumo | null;
  alCambiarSinGuardar: (sinGuardar: boolean) => void;
  alTerminar: () => void;
  alCancelar: () => void;
}

function aDatos({ control, requiereVencimiento, ...resto }: Datos): DatosInsumo {
  return {
    ...resto,
    requiereLote: control === 'lote',
    requiereSerie: control === 'serie',
    // El vencimiento vive en el lote.
    requiereVencimiento: control === 'lote' && requiereVencimiento,
  };
}

const OPCIONES_CONTROL = CONTROLES_INSUMO.map((control) => ({ valor: control, ...ETIQUETAS_CONTROL[control] }));

export function FormularioInsumo({ insumo, alCambiarSinGuardar, alTerminar, alCancelar }: PropiedadesFormularioInsumo) {
  const { notificar } = useNotificaciones();
  const mutacion = useMutacionInventario((datos: DatosInsumo) =>
    insumo ? actualizarInsumo(insumo.id, soloCambios<DatosInsumo>(insumo, datos)) : crearInsumo(datos),
  );
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isDirty },
  } = useForm<EntradaInsumo, unknown, Datos>({
    resolver: zodResolver(esquemaInsumo),
    defaultValues: {
      codigo: insumo?.codigo ?? '',
      nombre: insumo?.nombre ?? '',
      tipo: insumo?.tipo ?? '',
      categoria: insumo?.categoria ?? '',
      unidadMedida: insumo?.unidadMedida ?? '',
      marca: insumo?.marca ?? '',
      fabricante: insumo?.fabricante ?? '',
      descripcion: insumo?.descripcion ?? '',
      // Por defecto el backend controla por lote.
      control: insumo?.control ?? 'lote',
      requiereVencimiento: insumo?.requiereVencimiento ?? false,
      requiereRegistroSanitario: insumo?.requiereRegistroSanitario ?? false,
      esControlEspecial: insumo?.esControlEspecial ?? false,
      stockMinimo: insumo ? String(insumo.stockMinimo) : '0',
    },
  });
  const tipoControl = useWatch({ control, name: 'control' });

  useEffect(() => alCambiarSinGuardar(isDirty), [isDirty, alCambiarSinGuardar]);

  // Sin lote no hay dónde guardar el vencimiento.
  useEffect(() => {
    if (tipoControl !== 'lote') setValue('requiereVencimiento', false);
  }, [tipoControl, setValue]);

  const enviar = (datos: Datos) =>
    mutacion.mutate(aDatos(datos), {
      onSuccess: (guardado) => {
        notificar({ tono: 'exito', titulo: insumo ? 'Insumo actualizado' : 'Insumo creado', descripcion: guardado.nombre });
        alTerminar();
      },
      onError: (error) => {
        if (error.estado !== 409) return;
        // 409: código repetido, o se intentó cambiar el control de un insumo con existencias.
        if (/c[oó]digo/i.test(error.message)) setError('codigo', { message: error.message });
        else setError('control', { message: error.message });
      },
    });

  const errorEnCampo = mutacion.error?.estado === 409;
  const enviando = mutacion.isPending;

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="flex min-h-full flex-col">
      <div className="flex-1 space-y-8 px-6 py-6">
        {mutacion.error && !errorEnCampo && <AlertaError error={mutacion.error} />}

        <fieldset disabled={enviando} className="space-y-5">
          <legend className="mb-4 text-sm font-semibold text-texto">Identificación</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <CampoTexto id="codigo" etiqueta="Código" icono={Hash} placeholder="MED-0001" autoCapitalize="characters" maxLength={50} ayuda="Único. Se guarda en mayúscula." error={errors.codigo?.message} {...register('codigo')} />
            <CampoSelector id="tipo" etiqueta="Tipo" icono={Tag} error={errors.tipo?.message} {...register('tipo')}>
              <option value="" disabled>
                Selecciona un tipo
              </option>
              {TIPOS_INSUMO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {ETIQUETAS_TIPO_INSUMO[tipo]}
                </option>
              ))}
            </CampoSelector>
          </div>
          <CampoTexto id="nombre" etiqueta="Nombre" icono={Package} placeholder="Adrenalina 1 mg/ml" maxLength={150} error={errors.nombre?.message} {...register('nombre')} />
          <div className="grid gap-5 sm:grid-cols-2">
            <CampoTexto id="categoria" etiqueta="Categoría" icono={FolderTree} obligatorio={false} placeholder="Vasopresores" maxLength={100} error={errors.categoria?.message} {...register('categoria')} />
            <CampoTexto id="unidadMedida" etiqueta="Unidad de medida" icono={Ruler} placeholder="ampolla" maxLength={30} error={errors.unidadMedida?.message} {...register('unidadMedida')} />
          </div>
        </fieldset>

        <fieldset disabled={enviando} className="space-y-5">
          <legend className="mb-4 text-sm font-semibold text-texto">Presentación</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <CampoTexto id="marca" etiqueta="Marca" icono={Tags} obligatorio={false} maxLength={100} error={errors.marca?.message} {...register('marca')} />
            <CampoTexto id="fabricante" etiqueta="Fabricante" icono={Factory} obligatorio={false} maxLength={150} error={errors.fabricante?.message} {...register('fabricante')} />
          </div>
          <CampoTexto id="descripcion" etiqueta="Descripción" icono={Text} obligatorio={false} maxLength={5000} error={errors.descripcion?.message} {...register('descripcion')} />
        </fieldset>

        <div className="space-y-4">
          <Controller
            control={control}
            name="control"
            render={({ field }) => (
              <OpcionesRadio
                nombre="control"
                leyenda="Cómo se controla"
                valor={field.value}
                opciones={OPCIONES_CONTROL}
                deshabilitado={enviando}
                alCambiar={field.onChange}
              />
            )}
          />
          {errors.control?.message ? (
            <p className="text-[13px] text-critico">{errors.control.message}</p>
          ) : (
            insumo && (
              <p className="text-[13px] text-texto-secundario">
                Si el insumo ya tiene existencias o movimientos, el control no se puede cambiar.
              </p>
            )
          )}
          <div className="flex flex-col gap-3 rounded-2xl border border-borde/70 bg-white/50 px-4 py-3">
            <Controller
              control={control}
              name="requiereVencimiento"
              render={({ field }) => (
                <Interruptor
                  etiqueta="Cada lote exige fecha de vencimiento"
                  activo={field.value}
                  deshabilitado={enviando || tipoControl !== 'lote'}
                  alCambiar={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="requiereRegistroSanitario"
              render={({ field }) => (
                <Interruptor
                  etiqueta="Exige registro sanitario vigente"
                  activo={field.value}
                  deshabilitado={enviando}
                  alCambiar={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="esControlEspecial"
              render={({ field }) => (
                <Interruptor etiqueta="Medicamento de control especial" activo={field.value} deshabilitado={enviando} alCambiar={field.onChange} />
              )}
            />
          </div>
        </div>

        <fieldset disabled={enviando}>
          <legend className="mb-4 text-sm font-semibold text-texto">Existencias</legend>
          <CampoTexto
            id="stockMinimo"
            etiqueta="Stock mínimo en bodegas"
            icono={Gauge}
            inputMode="decimal"
            ayuda="Si el total en bodegas activas queda por debajo, sale en las alertas."
            error={errors.stockMinimo?.message}
            {...register('stockMinimo')}
          />
        </fieldset>
      </div>

      <PieFormulario
        textoEnviar={insumo ? 'Guardar cambios' : 'Crear insumo'}
        textoEnviando="Guardando…"
        icono={insumo ? Save : Plus}
        enviando={enviando}
        deshabilitado={insumo !== null && !isDirty}
        alCancelar={alCancelar}
      />
    </form>
  );
}
