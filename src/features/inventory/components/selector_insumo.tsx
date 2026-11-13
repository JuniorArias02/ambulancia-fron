import { Package } from 'lucide-react';
import { CampoBuscable } from '../../../components/forms/campo_buscable';
import type { Insumo } from '../types/inventario.types';
import { opcionesInsumos } from '../utils/opciones_inventario';

interface PropiedadesSelectorInsumo {
  id: string;
  etiqueta: string;
  insumos: readonly Insumo[] | undefined;
  cargando: boolean;
  valor: string;
  alCambiar: (insumoId: string) => void;
  alSalir?: () => void;
  deshabilitado?: boolean;
  ayuda?: string;
  error?: string;
}

/** Insumo del catálogo, buscable por nombre, código o unidad. */
export function SelectorInsumo({ insumos, cargando, ayuda, ...propiedades }: PropiedadesSelectorInsumo) {
  return (
    <CampoBuscable
      icono={Package}
      opciones={opcionesInsumos(insumos ?? [])}
      placeholder={cargando ? 'Cargando insumos…' : 'Busca por nombre o código'}
      textoSinResultados="Ningún insumo coincide"
      ayuda={cargando ? 'Cargando insumos…' : ayuda}
      {...propiedades}
    />
  );
}
