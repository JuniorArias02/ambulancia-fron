import { useMemo, useState } from 'react';
import { useAhora } from '../../../hooks/use_ahora';
import type { Ambulancia } from '../../ambulances/types/ambulancia.types';
import { DialogoDespachar } from '../../assignments/components/dialogo_despachar';
import { rutasVigentesPorAmbulancia } from '../../assignments/utils/formato_ruta';
import type { Emergencia } from '../../emergencies/types/emergencia.types';
import { MapaOperativo } from '../../map/components/mapa_operativo';
import { useDatosOperativos } from '../hooks/use_datos_operativos';
import {
  asignacionesPorAmbulancia,
  contarPorFiltro,
  cumpleFiltro,
  etapasPorEmergencia,
  type FiltroFlota,
} from '../utils/flota';
import { CapaOperativa, type Seleccion } from './capa_operativa';
import { FiltroFlotaMapa } from './filtro_flota';
import { LeyendaMapa } from './leyenda_mapa';
import { PanelOperativo } from './panel_operativo';

/** Las etiquetas de antigüedad del GPS se recalculan aunque no lleguen datos nuevos. */
const INTERVALO_RELOJ_MS = 15_000;

/** Mapa con las emergencias activas y la flota, más el panel para despachar sin salir del mapa. */
export function CentroOperaciones() {
  const ahora = useAhora(INTERVALO_RELOJ_MS);
  const { emergencias, ambulancias, asignaciones, rutas } = useDatosOperativos();
  const [seleccion, setSeleccion] = useState<Seleccion | null>(null);
  const [despachando, setDespachando] = useState<Emergencia | null>(null);
  const [filtro, setFiltro] = useState<FiltroFlota>('todas');

  const listaEmergencias = emergencias.data?.datos ?? [];
  const flota = ambulancias.data?.datos ?? [];
  // Memorizados: la geometría de las rutas solo se recalcula cuando cambian los datos.
  const servicios = useMemo(() => asignacionesPorAmbulancia(asignaciones.data?.datos ?? []), [asignaciones.data]);
  // Solo las de servicios que siguen asignados o en camino: al llegar a la escena la línea se quita.
  const rutasVigentes = useMemo(() => rutasVigentesPorAmbulancia(rutas.data ?? [], servicios), [rutas.data, servicios]);
  const etapas = useMemo(() => etapasPorEmergencia(asignaciones.data?.datos ?? []), [asignaciones.data]);
  const pasaFiltro = (ambulancia: Ambulancia) => cumpleFiltro(ambulancia, filtro);
  const error = emergencias.error ?? ambulancias.error ?? asignaciones.error;

  return (
    <>
      <MapaOperativo>
        <CapaOperativa
          emergencias={listaEmergencias}
          ambulancias={flota}
          ambulanciaVisible={pasaFiltro}
          asignaciones={servicios}
          rutas={rutasVigentes}
          etapas={etapas}
          seleccion={seleccion}
          ahora={ahora}
          alSeleccionar={setSeleccion}
          alCerrarEmergencia={(id) =>
            // Al cambiar de selección el panel anterior también se cierra: no debe borrar la nueva.
            setSeleccion((actual) => (actual?.tipo === 'emergencia' && actual.id === id ? null : actual))
          }
          alDespachar={setDespachando}
        />
      </MapaOperativo>

      <div className="absolute top-(--lienzo-superior) right-16 left-3 z-1000 flex md:right-[380px] md:left-(--lienzo-izquierda)">
        <FiltroFlotaMapa filtro={filtro} conteos={contarPorFiltro(flota)} alCambiar={setFiltro} />
      </div>

      {/* En móvil se ancla abajo; desde md ocupa la columna derecha sin bloquear el mapa que queda libre. */}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-1000 flex max-h-[42dvh] flex-col *:pointer-events-auto md:inset-x-auto md:top-[calc(var(--lienzo-superior)+56px)] md:right-4 md:bottom-16 md:max-h-none md:w-[340px]">
        <PanelOperativo
          emergencias={listaEmergencias}
          ambulancias={flota}
          ambulanciasFiltradas={flota.filter(pasaFiltro)}
          asignaciones={servicios}
          rutas={rutasVigentes}
          seleccion={seleccion}
          ahora={ahora}
          cargando={emergencias.isPending || ambulancias.isPending}
          actualizando={emergencias.isFetching || ambulancias.isFetching || asignaciones.isFetching}
          error={error ? `No fue posible actualizar el mapa: ${error.message}` : null}
          alSeleccionar={setSeleccion}
          alDespachar={setDespachando}
        />
      </div>

      <div className="absolute bottom-3 left-(--lienzo-izquierda) z-1000 hidden lg:block">
        <LeyendaMapa />
      </div>

      {despachando && <DialogoDespachar emergencia={despachando} alCerrar={() => setDespachando(null)} />}
    </>
  );
}
