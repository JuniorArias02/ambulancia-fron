import { Ambulance, Warehouse } from 'lucide-react';
import { ETIQUETAS_ESTADO_MOVIMIENTO } from '../constants/catalogos_inventario';
import { TONO_ESTADO_MOVIMIENTO } from '../constants/estilos_inventario';
import type { EstadoMovimiento, UbicacionMovimiento } from '../types/inventario.types';
import { Insignia } from './insignia';

export function InsigniaEstadoMovimiento({ estado }: { estado: EstadoMovimiento }) {
  return <Insignia tono={TONO_ESTADO_MOVIMIENTO[estado]}>{ETIQUETAS_ESTADO_MOVIMIENTO[estado]}</Insignia>;
}

/** Nombre de una ubicación con el icono de su tipo; `—` si el movimiento no la lleva. */
export function NombreUbicacion({ ubicacion }: { ubicacion: UbicacionMovimiento | null }) {
  if (!ubicacion) return <span className="text-texto-secundario">—</span>;
  const Icono = ubicacion.tipo === 'ambulancia' ? Ambulance : Warehouse;
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icono aria-hidden strokeWidth={1.75} className="size-3.5 shrink-0 text-texto-secundario" />
      <span className="truncate">{ubicacion.nombre ?? 'Sin nombre'}</span>
    </span>
  );
}
