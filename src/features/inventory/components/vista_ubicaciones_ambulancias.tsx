import { Ambulance, LoaderCircle, Plus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { SelectorBuscable } from '../../../components/forms/selector_buscable';
import { claseControlFiltro } from '../../../components/forms/selector_filtro';
import { EstadoError } from '../../../components/states/estado_error';
import { Interruptor } from '../../../components/ui/interruptor';
import { useNotificaciones } from '../../../hooks/use_notificaciones';
import { useFlota } from '../../ambulances/hooks/use_ambulancias';
import { claseBotonPrimario } from '../constants/estilos_inventario';
import { useUbicaciones } from '../hooks/use_consultas_inventario';
import { useMutacionInventario } from '../hooks/use_mutacion_inventario';
import { cambiarEstadoUbicacion, habilitarAmbulancia } from '../services/bodegas.service';
import type { UbicacionInventario } from '../types/inventario.types';
import { EsqueletoFilas, EstadoVacio } from './listado_inventario';
import { TablaInventario, type Columna } from './tabla_inventario';

/** Ambulancias con inventario propio. También se habilitan solas cuando su paramédico abre el inventario. */
export function VistaUbicacionesAmbulancias() {
  const { notificar } = useNotificaciones();
  const ubicaciones = useUbicaciones('ambulancia');
  const flota = useFlota();
  const [elegida, setElegida] = useState('');
  const habilitar = useMutacionInventario((ambulanciaId: string) => habilitarAmbulancia(ambulanciaId));
  const estado = useMutacionInventario(({ ubicacion, activa }: { ubicacion: UbicacionInventario; activa: boolean }) =>
    cambiarEstadoUbicacion(ubicacion.id, activa),
  );

  const habilitadas = new Set((ubicaciones.data ?? []).map((ubicacion) => ubicacion.ambulanciaId));
  const pendientes = (flota.data?.datos ?? []).filter((ambulancia) => !habilitadas.has(ambulancia.id));

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    if (!elegida) return;
    habilitar.mutate(elegida, {
      onSuccess: (ubicacion) => {
        notificar({ tono: 'exito', titulo: 'Ambulancia habilitada', descripcion: `${ubicacion.nombre ?? 'La ambulancia'} ya puede recibir transferencias.` });
        setElegida('');
      },
      onError: (error) => notificar({ tono: 'error', titulo: 'No fue posible habilitarla', descripcion: error.message }),
    });
  };

  const columnas: Columna<UbicacionInventario>[] = [
    {
      clave: 'ambulancia',
      encabezado: 'Ambulancia',
      celda: (ubicacion) => (
        <span className="inline-flex items-center gap-2 font-semibold">
          <Ambulance aria-hidden strokeWidth={1.75} className="size-4 text-primario" />
          {ubicacion.nombre ?? 'Ambulancia'}
        </span>
      ),
    },
    {
      clave: 'activa',
      encabezado: 'Inventario',
      celda: (ubicacion) => (
        <Interruptor
          etiqueta={ubicacion.activa ? 'Activo' : 'Inactivo'}
          activo={ubicacion.activa}
          deshabilitado={estado.isPending}
          alCambiar={(activa) =>
            estado.mutate(
              { ubicacion, activa },
              { onError: (error) => notificar({ tono: 'error', titulo: 'No fue posible cambiar el estado', descripcion: error.message }) },
            )
          }
        />
      ),
    },
  ];

  return (
    <>
      <form onSubmit={enviar} className="flex flex-col gap-2 border-b border-borde/70 px-5 py-4 sm:flex-row sm:items-center">
        <div className="relative sm:w-72">
          <SelectorBuscable
            etiqueta="Ambulancia por habilitar"
            opciones={pendientes.map((ambulancia) => ({ valor: ambulancia.id, texto: ambulancia.codigo, detalle: ambulancia.tipo.nombre }))}
            valor={elegida}
            alCambiar={setElegida}
            placeholder={pendientes.length === 0 && flota.isSuccess ? 'Todas están habilitadas' : 'Busca la ambulancia'}
            textoSinResultados="Ninguna ambulancia coincide"
            deshabilitado={!flota.isSuccess || pendientes.length === 0}
            claseEntrada={`${claseControlFiltro} w-full px-3`}
          />
        </div>
        <button type="submit" disabled={!elegida || habilitar.isPending} className={claseBotonPrimario}>
          {habilitar.isPending ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <Plus aria-hidden strokeWidth={1.75} className="size-4" />}
          Habilitar inventario
        </button>
      </form>
      {ubicaciones.isPending ? (
        <EsqueletoFilas etiqueta="Cargando ambulancias" />
      ) : ubicaciones.isError ? (
        <EstadoError titulo="No fue posible cargar las ambulancias" mensaje={ubicaciones.error.message} alReintentar={() => void ubicaciones.refetch()} />
      ) : ubicaciones.data.length === 0 ? (
        <EstadoVacio titulo="Ninguna ambulancia tiene inventario" mensaje="Habilita una para poder abastecerla desde la bodega." conFiltros={false} />
      ) : (
        <TablaInventario
          filas={[...ubicaciones.data].sort((a, b) => (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es', { numeric: true }))}
          columnas={columnas}
          claveFila={(ubicacion) => ubicacion.id}
          etiquetaFila={(ubicacion) => ubicacion.nombre ?? 'ambulancia'}
        />
      )}
    </>
  );
}
