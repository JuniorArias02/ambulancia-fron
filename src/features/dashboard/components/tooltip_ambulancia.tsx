import { ETIQUETAS_ESTADO_OPERATIVO } from '../../ambulances/constants/estados_operativos';
import type { Ambulancia } from '../../ambulances/types/ambulancia.types';
import { ETIQUETAS_ESTADO_ASIGNACION } from '../../assignments/constants/asignaciones';
import type { Ruta } from '../../assignments/schemas/ruta.schema';
import type { Asignacion } from '../../assignments/types/asignacion.types';
import { resumenRuta } from '../../assignments/utils/formato_ruta';

interface PropiedadesTooltipAmbulancia {
  ambulancia: Ambulancia;
  asignacion: Asignacion | undefined;
  ruta: Ruta | undefined;
  esperandoRuta: boolean;
  textoSenal: string;
  senalReciente: boolean;
}

/** "AMB-01 · En servicio / → EMG-… · En camino / 2,5 km · ≈ 4 min / Posición de hace 1 min". */
export function TooltipAmbulancia({
  ambulancia,
  asignacion,
  ruta,
  esperandoRuta,
  textoSenal,
  senalReciente,
}: PropiedadesTooltipAmbulancia) {
  return (
    <>
      <span className="block font-semibold text-texto">
        {ambulancia.codigo} · {ETIQUETAS_ESTADO_OPERATIVO[ambulancia.estadoOperativo]}
      </span>
      {asignacion && (
        <span className="block text-texto">
          → {asignacion.numeroEmergencia ?? 'Emergencia'} · {ETIQUETAS_ESTADO_ASIGNACION[asignacion.estado]}
        </span>
      )}
      {ruta && <span className="block text-primario">{resumenRuta(ruta)}</span>}
      {esperandoRuta && <span className="block text-texto-secundario">Calculando ruta…</span>}
      <span className={`block ${senalReciente ? 'text-texto-secundario' : 'text-advertencia-hover'}`}>{textoSenal}</span>
    </>
  );
}
