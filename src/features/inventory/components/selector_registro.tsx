import { FileBadge } from 'lucide-react';
import { CampoBuscable } from '../../../components/forms/campo_buscable';
import { LIMITE_MAXIMO } from '../constants/catalogos_inventario';
import { useRegistros } from '../hooks/use_consultas_inventario';
import { formatearDia } from '../utils/formato_inventario';

interface PropiedadesSelectorRegistro {
  id: string;
  insumoId: string;
  obligatorioPorInsumo: boolean;
  valor: string;
  alCambiar: (registroId: string) => void;
  alSalir?: () => void;
  error?: string;
}

/** Registros sanitarios vigentes del insumo elegido. */
export function SelectorRegistro({ insumoId, obligatorioPorInsumo, ...propiedades }: PropiedadesSelectorRegistro) {
  const registros = useRegistros({ insumoId, estado: 'vigente', pagina: 1, limite: LIMITE_MAXIMO }, Boolean(insumoId));
  const vigentes = registros.data?.datos.filter((registro) => registro.vigenteHoy) ?? [];
  const opciones = [
    ...(obligatorioPorInsumo ? [] : [{ valor: '', texto: 'Sin registro' }]),
    ...vigentes.map((registro) => ({
      valor: registro.id,
      texto: registro.numeroRegistro,
      detalle: registro.fechaVencimiento ? `Vence ${formatearDia(registro.fechaVencimiento)}` : 'Sin fecha de vencimiento',
    })),
  ];

  return (
    <CampoBuscable
      etiqueta="Registro sanitario"
      icono={FileBadge}
      obligatorio={obligatorioPorInsumo}
      opciones={opciones}
      placeholder={obligatorioPorInsumo ? 'Busca el registro' : 'Sin registro'}
      deshabilitado={!insumoId || vigentes.length === 0}
      ayuda={
        !insumoId
          ? 'Elige primero el insumo.'
          : registros.isPending
            ? 'Cargando registros…'
            : vigentes.length === 0
              ? 'Este insumo no tiene registros vigentes. Créalo en «Registros sanitarios».'
              : undefined
      }
      {...propiedades}
    />
  );
}
