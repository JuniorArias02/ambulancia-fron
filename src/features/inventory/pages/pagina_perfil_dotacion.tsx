import { ArrowLeft, CircleCheck, CircleSlash, CopyPlus, ListChecks, LoaderCircle, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { generatePath, Link, useNavigate, useParams } from 'react-router';
import { EstadoError } from '../../../components/states/estado_error';
import { RUTAS } from '../../../constants/rutas';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { DialogoDatosPerfil, DialogoDetalle, DialogoEstadoPerfil, DialogoQuitarDetalle } from '../components/dialogos_perfil';
import { FormularioNuevoDetalle } from '../components/formulario_nuevo_detalle';
import { Insignia } from '../components/insignia';
import { InsigniaPerfil } from '../components/insignia_perfil';
import { EstadoVacio } from '../components/listado_inventario';
import { TablaInventario, type Columna } from '../components/tabla_inventario';
import { claseBotonPrimario, claseBotonSecundario } from '../constants/estilos_inventario';
import { useCatalogoInsumos, usePerfil } from '../hooks/use_consultas_inventario';
import { useMutacionInventario } from '../hooks/use_mutacion_inventario';
import { crearVersionPerfil } from '../services/perfiles.service';
import type { DetallePerfil } from '../types/inventario.types';
import { formatearCantidad, formatearDia } from '../utils/formato_inventario';

type Accion = { tipo: 'datos' | 'estado' } | { tipo: 'detalle' | 'quitar'; detalle: DetallePerfil };

const COLUMNAS: Columna<DetallePerfil>[] = [
  {
    clave: 'insumo',
    encabezado: 'Insumo',
    celda: (detalle) => (
      <div className="min-w-0">
        <p className="font-medium">{detalle.insumoNombre}</p>
        <p className="text-[13px] text-texto-secundario">{detalle.insumoCodigo}</p>
      </div>
    ),
  },
  {
    clave: 'requerida',
    encabezado: 'Requerida',
    celda: (detalle) => (
      <span className="tabular-nums">
        {formatearCantidad(detalle.cantidadRequerida)} <span className="text-texto-secundario">{detalle.unidadMedida}</span>
      </span>
    ),
  },
  {
    clave: 'minima',
    encabezado: 'Mínima',
    celda: (detalle) => <span className="tabular-nums">{formatearCantidad(detalle.cantidadMinima ?? detalle.cantidadRequerida)}</span>,
  },
  {
    clave: 'obligatorio',
    encabezado: 'Tipo',
    celda: (detalle) => (detalle.obligatorio ? <Insignia tono="primario">Obligatorio</Insignia> : <Insignia tono="neutro">Opcional</Insignia>),
  },
  { clave: 'observaciones', encabezado: 'Observaciones', celda: (detalle) => detalle.observaciones ?? '—', clase: 'hidden xl:table-cell text-[13px]' },
];

export function PaginaPerfilDotacion() {
  const { id = '' } = useParams();
  const navegar = useNavigate();
  const { notificar } = useNotificaciones();
  const consulta = usePerfil(id);
  const insumos = useCatalogoInsumos();
  const version = useMutacionInventario(() => crearVersionPerfil(id));
  const [accion, setAccion] = useState<Accion | null>(null);
  const cerrar = () => setAccion(null);

  if (consulta.isPending) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div role="status" aria-label="Cargando perfil" className="animate-pulse space-y-3">
          <div className="vidrio h-36 rounded-2xl" />
          <div className="vidrio h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (consulta.isError) {
    const noExiste = consulta.error.estado === 404 || consulta.error.estado === 400;
    return (
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="vidrio rounded-2xl">
          <EstadoError
            titulo={noExiste ? 'Perfil no encontrado' : 'No fue posible cargar el perfil'}
            mensaje={noExiste ? 'Puede que el enlace no sea correcto.' : consulta.error.message}
            alReintentar={noExiste ? undefined : () => void consulta.refetch()}
            accionSecundaria={{ etiqueta: 'Volver a los perfiles', alPulsar: () => void navegar(RUTAS.perfilesDotacion) }}
          />
        </div>
      </div>
    );
  }

  const perfil = consulta.data;
  const controlDe = (insumoId: string) => insumos.data?.find((insumo) => insumo.id === insumoId)?.control;

  const nuevaVersion = () =>
    version.mutate(undefined, {
      onSuccess: (nueva) => {
        notificar({ tono: 'exito', titulo: `Versión ${nueva.version} creada`, descripcion: 'Ajusta sus elementos y vigencia, y actívala.' });
        void navegar(generatePath(RUTAS.perfilDotacion, { id: nueva.id }));
      },
      onError: (error) => notificar({ tono: 'error', titulo: 'No fue posible crear la versión', descripcion: error.message }),
    });

  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
      <section aria-labelledby="titulo-perfil" className="vidrio rounded-2xl px-5 pt-4 pb-5">
        <Link
          to={RUTAS.perfilesDotacion}
          className="inline-flex items-center gap-1.5 rounded-lg text-[13px] font-medium text-texto-secundario transition-colors duration-150 hover:text-primario focus-visible:ring-2 focus-visible:ring-primario/40 focus-visible:outline-none"
        >
          <ArrowLeft aria-hidden strokeWidth={1.75} className="size-4" />
          Perfiles de dotación
        </Link>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primario/10 text-primario">
              <ListChecks strokeWidth={1.75} className="size-6" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h2 id="titulo-perfil" className="truncate text-2xl font-semibold tracking-tight text-texto">
                  {perfil.nombre}
                </h2>
                <InsigniaPerfil perfil={perfil} />
                {consulta.isFetching && <LoaderCircle aria-label="Actualizando" className="size-4 animate-spin text-texto-secundario" />}
              </div>
              <p className="mt-1 text-sm text-texto-secundario">
                {perfil.codigo} · versión {perfil.version} · {perfil.tipoAmbulanciaNombre ?? 'Tipo sin nombre'} · Vigencia{' '}
                {perfil.vigenteDesde || perfil.vigenteHasta
                  ? `${formatearDia(perfil.vigenteDesde)} – ${perfil.vigenteHasta ? formatearDia(perfil.vigenteHasta) : 'sin fin'}`
                  : 'sin límite'}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button type="button" onClick={() => setAccion({ tipo: 'datos' })} className={claseBotonSecundario}>
              <Pencil aria-hidden strokeWidth={1.75} className="size-4" />
              Editar datos
            </button>
            <button type="button" onClick={nuevaVersion} disabled={version.isPending} className={claseBotonSecundario}>
              {version.isPending ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <CopyPlus aria-hidden strokeWidth={1.75} className="size-4" />}
              Nueva versión
            </button>
            {perfil.activo ? (
              <button type="button" onClick={() => setAccion({ tipo: 'estado' })} className={claseBotonSecundario}>
                <CircleSlash aria-hidden strokeWidth={1.75} className="size-4" />
                Desactivar
              </button>
            ) : (
              <button type="button" onClick={() => setAccion({ tipo: 'estado' })} disabled={perfil.detalles.length === 0} className={claseBotonPrimario}>
                <CircleCheck aria-hidden strokeWidth={1.75} className="size-4" />
                Activar
              </button>
            )}
          </div>
        </div>
        <p className="mt-4 rounded-xl bg-primario/5 px-4 py-3 text-[13px] text-texto">
          Para cambiar la dotación: <span className="font-medium">Nueva versión</span> → ajusta elementos y vigencia →{' '}
          <span className="font-medium">Activar</span>. La versión anterior queda inactiva como historial.
        </p>
      </section>

      <section aria-labelledby="titulo-elementos" className="vidrio-fuerte rounded-2xl">
        <header className="flex items-center justify-between gap-2 border-b border-borde/70 px-5 py-4">
          <h3 id="titulo-elementos" className="text-base font-semibold text-texto">
            Elementos
          </h3>
          <span className="text-[13px] text-texto-secundario">{perfil.detalles.length}</span>
        </header>
        {perfil.detalles.length === 0 ? (
          <EstadoVacio titulo="Sin elementos" mensaje="Agrega al menos uno para poder activar el perfil." conFiltros={false} />
        ) : (
          <TablaInventario
            filas={perfil.detalles}
            columnas={COLUMNAS}
            claveFila={(detalle) => detalle.id}
            etiquetaFila={(detalle) => detalle.insumoNombre}
            acciones={(detalle) => [
              { etiqueta: 'Editar', icono: Pencil, alSeleccionar: () => setAccion({ tipo: 'detalle', detalle }) },
              { etiqueta: 'Quitar', icono: Trash2, tono: 'peligro', alSeleccionar: () => setAccion({ tipo: 'quitar', detalle }) },
            ]}
          />
        )}
        <FormularioNuevoDetalle perfil={perfil} insumos={insumos.data} />
      </section>

      {accion?.tipo === 'datos' && <DialogoDatosPerfil perfil={perfil} alCerrar={cerrar} />}
      {accion?.tipo === 'estado' && <DialogoEstadoPerfil perfil={perfil} alCerrar={cerrar} />}
      {accion?.tipo === 'detalle' && <DialogoDetalle perfil={perfil} detalle={accion.detalle} control={controlDe(accion.detalle.insumoId)} alCerrar={cerrar} />}
      {accion?.tipo === 'quitar' && <DialogoQuitarDetalle perfil={perfil} detalle={accion.detalle} alCerrar={cerrar} />}
    </div>
  );
}
