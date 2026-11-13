import { zodResolver } from '@hookform/resolvers/zod';
import { Droplets, LoaderCircle, MapPin, NotebookPen, Plus, Thermometer } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { AlertaError } from '../../../components/feedback/alerta_error';
import { CampoBuscable } from '../../../components/forms/campo_buscable';
import { CampoTexto } from '../../../components/forms/campo_texto';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { formatearFechaHora } from '../../../utils/formato_fecha';
import { LIMITE_POR_PAGINA } from '../constants/catalogos_inventario';
import { claseBotonPrimario } from '../constants/estilos_inventario';
import { useControles, useUbicaciones } from '../hooks/use_consultas_inventario';
import { useMutacionInventario } from '../hooks/use_mutacion_inventario';
import { useParametrosUrl } from '../hooks/use_parametros_url';
import { esquemaControl, type EntradaControl, type FormularioControl } from '../schemas/bodegas.schema';
import { registrarControl } from '../services/bodegas.service';
import type { ControlAlmacenamiento, UbicacionInventario } from '../types/inventario.types';
import { leerPagina } from '../utils/formato_inventario';
import { opcionesUbicaciones } from '../utils/opciones_inventario';
import { BarraFiltros, CampoDia, FiltroBuscable } from './campos_filtro';
import { ListadoInventario } from './listado_inventario';
import type { Columna } from './tabla_inventario';

const formatoLectura = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });

const COLUMNAS: Columna<ControlAlmacenamiento>[] = [
  {
    clave: 'fecha',
    encabezado: 'Registrado',
    celda: (control) => (
      <div>
        <p className="font-medium tabular-nums">{formatearFechaHora(control.registradoEn)}</p>
        <p className="text-[13px] text-texto-secundario">{control.usuarioNombre ?? '—'}</p>
      </div>
    ),
  },
  { clave: 'ubicacion', encabezado: 'Ubicación', celda: (control) => control.ubicacionNombre ?? '—' },
  {
    clave: 'temperatura',
    encabezado: 'Temperatura',
    celda: (control) => (control.temperatura === null ? '—' : `${formatoLectura.format(control.temperatura)} °C`),
    clase: 'tabular-nums whitespace-nowrap',
  },
  {
    clave: 'humedad',
    encabezado: 'Humedad',
    celda: (control) => (control.humedad === null ? '—' : `${formatoLectura.format(control.humedad)} %`),
    clase: 'tabular-nums whitespace-nowrap',
  },
  { clave: 'observaciones', encabezado: 'Observaciones', celda: (control) => control.observaciones ?? '—', clase: 'hidden lg:table-cell text-[13px]' },
];

function FormularioControl({ ubicaciones }: { ubicaciones: UbicacionInventario[] }) {
  const { notificar } = useNotificaciones();
  const mutacion = useMutacionInventario((datos: FormularioControl) => registrarControl(datos));
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EntradaControl, unknown, FormularioControl>({
    resolver: zodResolver(esquemaControl),
    defaultValues: { ubicacionId: '', temperatura: '', humedad: '', observaciones: '' },
  });

  const enviar = (datos: FormularioControl) =>
    mutacion.mutate(datos, {
      onSuccess: () => {
        notificar({ tono: 'exito', titulo: 'Lectura registrada' });
        reset({ ubicacionId: datos.ubicacionId, temperatura: '', humedad: '', observaciones: '' });
      },
    });

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="space-y-4 border-b border-borde/70 px-5 py-4">
      <p className="text-sm font-semibold text-texto">Registrar una lectura</p>
      {mutacion.error && <AlertaError error={mutacion.error} />}
      <fieldset disabled={mutacion.isPending} className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
        <Controller
          control={control}
          name="ubicacionId"
          render={({ field }) => (
            <CampoBuscable
              id="ubicacion-control"
              etiqueta="Ubicación"
              icono={MapPin}
              opciones={opcionesUbicaciones(ubicaciones)}
              valor={field.value}
              alCambiar={field.onChange}
              alSalir={field.onBlur}
              placeholder="Busca la bodega o ambulancia"
              textoSinResultados="Ninguna ubicación coincide"
              error={errors.ubicacionId?.message}
            />
          )}
        />
        <CampoTexto id="temperatura" etiqueta="Temperatura (°C)" icono={Thermometer} inputMode="decimal" obligatorio={false} placeholder="4,5" error={errors.temperatura?.message} {...register('temperatura')} />
        <CampoTexto id="humedad" etiqueta="Humedad (%)" icono={Droplets} inputMode="decimal" obligatorio={false} placeholder="55" error={errors.humedad?.message} {...register('humedad')} />
      </fieldset>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <CampoTexto id="observaciones-control" etiqueta="Observaciones" icono={NotebookPen} obligatorio={false} maxLength={5000} disabled={mutacion.isPending} {...register('observaciones')} />
        </div>
        <button type="submit" disabled={mutacion.isPending} className={`${claseBotonPrimario} h-12!`}>
          {mutacion.isPending ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <Plus aria-hidden strokeWidth={1.75} className="size-4" />}
          Registrar lectura
        </button>
      </div>
    </form>
  );
}

/** Cadena de frío: lecturas de temperatura y humedad por ubicación. */
export function VistaControles() {
  const { leer, actualizar } = useParametrosUrl();
  const ubicaciones = useUbicaciones();
  const activas = (ubicaciones.data ?? []).filter((ubicacion) => ubicacion.activa);
  const filtros = {
    ubicacionId: leer('ubicacionId'),
    desde: leer('desde'),
    hasta: leer('hasta'),
    pagina: leerPagina(leer('pagina')),
    limite: LIMITE_POR_PAGINA,
  };
  const controles = useControles(filtros);
  const opciones = opcionesUbicaciones(activas);

  return (
    <>
      <FormularioControl ubicaciones={activas} />
      <div className="border-b border-borde/70 px-5 py-4">
        <BarraFiltros>
          <FiltroBuscable etiqueta="Filtrar por ubicación" valor={filtros.ubicacionId} opciones={opciones} textoTodos="Todas las ubicaciones" alCambiar={(ubicacionId) => actualizar({ ubicacionId })} />
          <CampoDia etiqueta="Desde" valor={filtros.desde} maximo={filtros.hasta} alCambiar={(desde) => actualizar({ desde })} />
          <CampoDia etiqueta="Hasta" valor={filtros.hasta} minimo={filtros.desde} alCambiar={(hasta) => actualizar({ hasta })} />
        </BarraFiltros>
      </div>
      <ListadoInventario
        consulta={controles}
        columnas={COLUMNAS}
        claveFila={(control) => control.id}
        etiquetaFila={(control) => `lectura del ${formatearFechaHora(control.registradoEn)}`}
        tituloError="No fue posible cargar las lecturas"
        vacio={{ titulo: 'Aún no hay lecturas', mensaje: 'Registra la temperatura y la humedad de las bodegas y ambulancias.' }}
        conFiltros={Boolean(filtros.ubicacionId || filtros.desde || filtros.hasta)}
        alCambiarPagina={(pagina) => actualizar({ pagina })}
      />
    </>
  );
}
