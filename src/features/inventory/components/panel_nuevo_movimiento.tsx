import type { BorradorMovimiento } from '../schemas/movimiento.schema';
import type { Movimiento } from '../types/inventario.types';
import { FormularioMovimiento } from './formulario_movimiento';
import { PanelEdicion } from './panel_edicion';

interface PropiedadesPanelNuevoMovimiento {
  /** Propuesta de otra pantalla: abastecer una ambulancia, corregir una novedad… */
  inicial?: BorradorMovimiento;
  titulo?: string;
  /** Se llama con el movimiento registrado, antes de cerrar. */
  alRegistrar?: (movimiento: Movimiento) => void;
  alCerrar: () => void;
}

export function PanelNuevoMovimiento({ inicial, titulo = 'Nuevo movimiento', alRegistrar, alCerrar }: PropiedadesPanelNuevoMovimiento) {
  return (
    <PanelEdicion titulo={titulo} descripcion="Entradas, transferencias, ajustes y bajas." alCerrar={alCerrar}>
      {({ alCambiarSinGuardar, solicitarCierre }) => (
        <FormularioMovimiento
          inicial={inicial}
          alCambiarSinGuardar={alCambiarSinGuardar}
          alTerminar={(movimiento) => {
            alRegistrar?.(movimiento);
            alCerrar();
          }}
          alCancelar={solicitarCierre}
        />
      )}
    </PanelEdicion>
  );
}
